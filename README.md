# Obsidian Whisper Voice Input Plugin

A voice input plugin using local Whisper STT server and LLM. Runs completely locally without cloud APIs.

[Japanese README](README.ja.md)

## Features

- Voice recording with local STT server transcription
- Optional text formatting via LM Studio (OpenAI-compatible API)
- Insert transcribed text at current cursor position

## Server Setup

Start the required servers using Docker Compose:

```bash
docker compose up -d
```

This starts:
- **STT (faster-whisper-server)**: `http://localhost:2022/v1`
- **LLM (Ollama)**: `http://localhost:11434/v1`

```bash
# Stop servers
docker compose down
```

> **Note**: Docker runs on CPU only. For GPU acceleration on Apple Silicon Mac, install [Ollama](https://ollama.ai) and [faster-whisper-server](https://github.com/fedirz/faster-whisper-server) natively to use Metal GPU.

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
| LLM Server URL | Base URL for LLM server | `http://localhost:1234/v1` |
| LLM Model | LLM model name | `gemma2:2b` |
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

- Verify LM Studio is running with local server enabled
- Check that a model is loaded
- Verify LM Studio Base URL in settings

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
