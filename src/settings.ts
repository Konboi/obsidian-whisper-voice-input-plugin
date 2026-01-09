import {App, Notice, PluginSettingTab, Setting} from "obsidian";
import VoiceInputPlugin from "./main";

export type VoiceInputMode = "transcript-only" | "llm-format";

export interface VoiceInputSettings {
	sttBaseUrl: string;
	sttModel: string;
	lmBaseUrl: string;
	lmModel: string;
	mode: VoiceInputMode;
	systemPrompt: string;
}

export const DEFAULT_SETTINGS: VoiceInputSettings = {
	sttBaseUrl: "http://127.0.0.1:2022/v1",
	sttModel: "Systran/faster-whisper-small",
	lmBaseUrl: "http://localhost:1234/v1",
	lmModel: "gemma2:2b",
	mode: "transcript-only",
	systemPrompt: "Format the following transcribed text into natural, readable text. Add appropriate punctuation and fix obvious transcription errors. Do not change the content."
};

interface ModelInfo {
	id: string;
}

export class VoiceInputSettingTab extends PluginSettingTab {
	plugin: VoiceInputPlugin;

	constructor(app: App, plugin: VoiceInputPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	private async fetchModels(baseUrl: string): Promise<string[]> {
		const url = `${baseUrl}/models`;
		try {
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`HTTP ${response.status}`);
			}
			const result = await response.json();
			return result.data.map((model: ModelInfo) => model.id);
		} catch (error) {
			console.error('Failed to fetch models:', error);
			throw error;
		}
	}

	private createModelSelector(
		containerEl: HTMLElement,
		name: string,
		desc: string,
		getCurrentModel: () => string,
		setModel: (model: string) => Promise<void>,
		getBaseUrl: () => string
	): void {
		const setting = new Setting(containerEl)
			.setName(name)
			.setDesc(desc);

		let dropdown: HTMLSelectElement;

		setting.addDropdown(d => {
			dropdown = d.selectEl;
			d.addOption(getCurrentModel(), getCurrentModel());
			d.setValue(getCurrentModel());
			d.onChange(async (value) => {
				await setModel(value);
			});
		});

		setting.addButton(button => button
			.setButtonText("Fetch Models")
			.onClick(async () => {
				button.setButtonText("Fetching...");
				button.setDisabled(true);
				try {
					const models = await this.fetchModels(getBaseUrl());
					if (models.length === 0) {
						new Notice("No models found on the server");
					} else {
						const currentValue = getCurrentModel();
						dropdown.empty();
						for (const model of models) {
							const option = dropdown.createEl("option", {value: model, text: model});
							if (model === currentValue) {
								option.selected = true;
							}
						}
						if (!models.includes(currentValue) && models.length > 0) {
							const firstModel = models[0];
							if (firstModel) {
								await setModel(firstModel);
								dropdown.value = firstModel;
							}
						}
						new Notice(`Found ${models.length} model(s)`);
					}
				} catch (error) {
					new Notice(`Failed to fetch models: ${error}`);
				} finally {
					button.setButtonText("Fetch Models");
					button.setDisabled(false);
				}
			}));
	}

	display(): void {
		const {containerEl} = this;
		containerEl.empty();

		containerEl.createEl("h2", {text: "Voice Input Settings"});

		// STT Section
		containerEl.createEl("h3", {text: "Speech-to-Text (STT)"});

		new Setting(containerEl)
			.setName("STT Server URL")
			.setDesc("URL of your local Whisper server. Examples: faster-whisper-server (default port 2022), whisper.cpp server")
			.addText(text => text
				.setPlaceholder("http://127.0.0.1:2022/v1")
				.setValue(this.plugin.settings.sttBaseUrl)
				.onChange(async (value) => {
					this.plugin.settings.sttBaseUrl = value;
					await this.plugin.saveSettings();
				}));

		this.createModelSelector(
			containerEl,
			"STT Model",
			"Select a model from your STT server. Click 'Fetch Models' to load available models.",
			() => this.plugin.settings.sttModel,
			async (model) => {
				this.plugin.settings.sttModel = model;
				await this.plugin.saveSettings();
			},
			() => this.plugin.settings.sttBaseUrl
		);

		// LLM Section
		containerEl.createEl("h3", {text: "LLM Formatting (Optional)"});

		new Setting(containerEl)
			.setName("Mode")
			.setDesc("Choose whether to use raw transcription or format it with an LLM for better readability")
			.addDropdown(dropdown => dropdown
				.addOption("transcript-only", "Transcription only (faster)")
				.addOption("llm-format", "Format with LLM (cleaner output)")
				.setValue(this.plugin.settings.mode)
				.onChange(async (value: VoiceInputMode) => {
					this.plugin.settings.mode = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName("LLM Server URL")
			.setDesc("URL of your LLM server. Examples: LM Studio (port 1234), Ollama (port 11434)")
			.addText(text => text
				.setPlaceholder("http://localhost:1234/v1")
				.setValue(this.plugin.settings.lmBaseUrl)
				.onChange(async (value) => {
					this.plugin.settings.lmBaseUrl = value;
					await this.plugin.saveSettings();
				}));

		this.createModelSelector(
			containerEl,
			"LLM Model",
			"Select a model from your LLM server. Click 'Fetch Models' to load available models.",
			() => this.plugin.settings.lmModel,
			async (model) => {
				this.plugin.settings.lmModel = model;
				await this.plugin.saveSettings();
			},
			() => this.plugin.settings.lmBaseUrl
		);

		new Setting(containerEl)
			.setName("Formatting Prompt")
			.setDesc("Instructions for the LLM on how to format the transcription")
			.addTextArea(text => {
				text
					.setPlaceholder("Format the text...")
					.setValue(this.plugin.settings.systemPrompt)
					.onChange(async (value) => {
						this.plugin.settings.systemPrompt = value;
						await this.plugin.saveSettings();
					});
				text.inputEl.rows = 6;
				text.inputEl.cols = 50;
			});
	}
}
