# Obsidian Whisper Voice Input Plugin

A voice input plugin using a Whisper STT server and an OpenAI-compatible LLM API. It supports fully local processing with Ollama or a local Codex API proxy.

[Japanese README](README.ja.md)

## Features

- Voice recording with local STT server transcription
- Optional text formatting via an OpenAI-compatible LLM API
- Insert transcribed text at current cursor position

## Server Setup

Start the speech-to-text server using Docker Compose:

```bash
docker compose up -d
```

This starts **STT (faster-whisper-server)** at `http://localhost:2022/v1`.
Start your selected LLM server separately.

### Using the Codex local API

Start [go-openai-api-server-via-codex](https://github.com/Konboi/go-openai-api-server-via-codex), then select the following plugin settings:

- **Server type**: **Codex local API**
- **Server**: `http://127.0.0.1:38180/v1`
- **Model**: Select **Fetch models**, or enter a model exposed by the server
- **API key**: Enter it only when the server was started with `--api-key`

When the Codex local API is selected, the transcript is sent through the local proxy to the Codex backend. No other vault content is sent.

```bash
# Stop the STT server
docker compose down
```

> **Note**: The Docker Compose configuration runs Whisper on CPU. For GPU acceleration on Apple Silicon Mac, install [faster-whisper-server](https://github.com/fedirz/faster-whisper-server) natively to use Metal GPU.

## Installation

### Using BRAT (Recommended)

1. Install [BRAT](https://github.com/TfTHacker/obsidian42-brat) plugin
2. Open BRAT settings
3. Click "Add Beta plugin"
4. Enter: `Konboi/obsidian-whisper-voice-input-plugin`
5. Enable the plugin in **Settings → Community plugins**

### Manual Installation

1. Download `main.js` and `manifest.json` from [Releases](https://github.com/Konboi/obsidian-whisper-voice-input-plugin/releases)
2. Create `.obsidian/plugins/whisper-voice-input/` folder in your vault
3. Copy the downloaded files to the folder
4. Restart Obsidian
5. Enable plugin in **Settings → Community plugins**

## Usage

1. Open command palette (`Cmd/Ctrl + P`)
2. Run "Whisper Voice Input: Toggle Recording"
3. Recording starts (Notice displayed)
4. Run command again to stop recording
5. Transcription is automatically inserted at cursor position

## Settings

| Setting | Description | Default |
|---------|-------------|---------|
| STT Server URL | Base URL for STT server | `http://127.0.0.1:2022/v1` |
| STT Model | Whisper model name | `Systran/faster-whisper-small` |
| Mode | `Transcription only` or `Format with LLM` | `Transcription only` |
| Server type | `Ollama`, `Codex local API`, or `Custom` | `Ollama` |
| LLM Server URL | Base URL for LLM server | `http://127.0.0.1:11434/v1` |
| LLM Model | LLM model name | `gemma3:4b` |
| API key | Optional API key for the LLM server | Empty |
| Formatting Prompt | System prompt for LLM formatting | (Default formatting prompt) |

## Troubleshooting

### Microphone Permission Error

- Grant microphone access to Obsidian (or Electron)
- macOS: **System Settings → Privacy & Security → Microphone** - allow Obsidian
- Windows: **Settings → Privacy → Microphone** - allow app access

### Cannot Connect to STT Server

- Verify STT server is running
- Check STT Base URL in settings
- Ensure firewall is not blocking local connections

### Audio Format Mismatch

This plugin records in `audio/webm` format. If STT server doesn't support webm:

- When using whisper.cpp, ffmpeg may be required
- Server-side webm→wav conversion may be needed

### No Editor Selected

A Markdown file must be open and focused to insert transcription results.

### LLM Formatting Fails

- Verify the selected LLM server is running
- Check that a model is loaded
- Verify the LLM server URL in settings

If LLM formatting fails, raw transcription is inserted instead.

### CORS Error

May occur if local server doesn't return CORS headers. Enable CORS on the server side.

## Development

```bash
# Development mode (watch for file changes)
npm run dev

# Production build
npm run build

# Lint
npm run lint
```

## License

0-BSD
