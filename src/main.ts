import {MarkdownView, Notice, Plugin, requestUrl} from 'obsidian';
import {DEFAULT_SETTINGS, VoiceInputSettings, VoiceInputSettingTab} from "./settings";

interface TranscriptionResponse {
	text: string;
}

interface LLMResponse {
	choices: Array<{
		message: {
			content: string;
		};
	}>;
}

export default class VoiceInputPlugin extends Plugin {
	settings: VoiceInputSettings;
	private isRecording = false;
	private mediaRecorder: MediaRecorder | null = null;
	private audioChunks: Blob[] = [];
	private stream: MediaStream | null = null;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: 'toggle-voice-input',
			name: 'Toggle recording',
			callback: () => this.toggleRecording()
		});

		this.addSettingTab(new VoiceInputSettingTab(this.app, this));
	}

	onunload() {
		this.stopRecordingCleanup();
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<VoiceInputSettings>);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	private async toggleRecording() {
		if (this.isRecording) {
			await this.stopRecording();
		} else {
			await this.startRecording();
		}
	}

	private async startRecording() {
		try {
			this.stream = await navigator.mediaDevices.getUserMedia({audio: true});
			this.audioChunks = [];

			const mimeType = this.getSupportedMimeType();
			this.mediaRecorder = new MediaRecorder(this.stream, mimeType ? {mimeType} : undefined);

			this.mediaRecorder.ondataavailable = (event) => {
				if (event.data.size > 0) {
					this.audioChunks.push(event.data);
				}
			};

			this.mediaRecorder.onstop = async () => {
				await this.processRecording();
			};

			this.mediaRecorder.start();
			this.isRecording = true;
			new Notice('Recording started (run again to stop)');
		} catch (error) {
			console.error('Recording start error:', error);
			new Notice(`Failed: cannot access microphone - ${error instanceof Error ? error.message : String(error)}`);
		}
	}

	private getSupportedMimeType(): string | null {
		const mimeTypes = [
			'audio/webm',
			'audio/webm;codecs=opus',
			'audio/ogg;codecs=opus',
			'audio/mp4',
		];
		for (const mimeType of mimeTypes) {
			if (MediaRecorder.isTypeSupported(mimeType)) {
				return mimeType;
			}
		}
		return null;
	}

	private async stopRecording() {
		if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
			return;
		}

		this.mediaRecorder.stop();
		this.isRecording = false;
		new Notice('Recording stopped');

		this.stopRecordingCleanup();
	}

	private stopRecordingCleanup() {
		if (this.stream) {
			this.stream.getTracks().forEach(track => track.stop());
			this.stream = null;
		}
	}

	private async processRecording() {
		if (this.audioChunks.length === 0) {
			new Notice('Failed: no audio data');
			return;
		}

		const audioBlob = new Blob(this.audioChunks, {type: 'audio/webm'});

		try {
			new Notice('Transcribing...');
			const transcript = await this.transcribe(audioBlob);

			if (!transcript) {
				new Notice('Failed: empty transcription result');
				return;
			}

			let finalText = transcript;

			if (this.settings.mode === 'llm-format') {
				new Notice('Formatting...');
				try {
					finalText = await this.formatWithLLM(transcript);
				} catch (error) {
					console.error('LLM formatting error:', error);
					new Notice(`LLM formatting failed, using raw transcription: ${error instanceof Error ? error.message : String(error)}`);
				}
			}

			this.insertText(finalText);
		} catch (error) {
			console.error('Processing error:', error);
			new Notice(`Failed: ${error instanceof Error ? error.message : String(error)}`);
		}
	}

	private async transcribe(audioBlob: Blob): Promise<string> {
		const formData = new FormData();
		formData.append('file', audioBlob, 'audio.webm');
		formData.append('model', this.settings.sttModel);

		const url = `${this.settings.sttBaseUrl}/audio/transcriptions`;
		// eslint-disable-next-line no-restricted-globals -- FormData requires native fetch
		const response = await fetch(url, {
			method: 'POST',
			body: formData
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`STT error (${response.status}): ${errorText}`);
		}

		const result = await response.json() as TranscriptionResponse;
		return result.text;
	}

	private async formatWithLLM(transcript: string): Promise<string> {
		const url = `${this.settings.lmBaseUrl}/chat/completions`;
		const response = await requestUrl({
			url,
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				model: this.settings.lmModel,
				messages: [
					{role: 'system', content: this.settings.systemPrompt},
					{role: 'user', content: transcript}
				],
				temperature: 0.3
			})
		});

		if (response.status >= 400) {
			throw new Error(`LLM error (${response.status}): ${response.text}`);
		}

		const result = response.json as LLMResponse;
		const content = result.choices[0]?.message?.content;
		if (!content) {
			throw new Error('Empty response from language model');
		}
		return content;
	}

	private insertText(text: string) {
		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!view) {
			new Notice('Failed: no editor selected');
			return;
		}

		const editor = view.editor;
		editor.replaceSelection(text + '\n');
		new Notice('Inserted');
	}
}
