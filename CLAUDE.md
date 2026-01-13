# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Obsidian voice input plugin using local Whisper STT server and LLM. Runs completely locally without cloud APIs.

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Development mode (watch)
npm run build        # Production build (includes type check)
npm run lint         # Run ESLint
```

## Architecture

- **src/main.ts**: Plugin entry point
  - `VoiceInputPlugin`: Main plugin class
  - Recording toggle command registration
  - WebSocket streaming for real-time transcription
  - Text insertion into editor

- **src/settings.ts**: Settings management
  - `VoiceInputSettings`: Settings interface
  - `VoiceInputSettingTab`: Settings UI

## Key Components

### Recording Flow
1. `toggleRecording()` - Toggle recording start/stop
2. `startRecording()` - Start MediaRecorder
3. `stopRecording()` - Stop recording
4. `processRecording()` - Send audio to STT, optionally format with LLM, insert text

### API Endpoints
- STT: `POST {sttBaseUrl}/audio/transcriptions` (FormData: file, model)
- LLM: `POST {lmBaseUrl}/chat/completions` (JSON: model, messages, temperature)

### Settings
- `sttBaseUrl`: STT server URL (default: `http://127.0.0.1:2022/v1`)
- `sttModel`: STT model name (default: `Systran/faster-whisper-small`)
- `lmBaseUrl`: LLM server URL (default: `http://localhost:1234/v1`)
- `lmModel`: LLM model name (default: `gemma2:2b`)
- `mode`: `transcript-only` | `llm-format`
- `systemPrompt`: LLM formatting prompt

## Testing

1. Build with `npm run build`
2. Copy `main.js` and `manifest.json` to `<Vault>/.obsidian/plugins/whisper-voice-input/`
3. Restart Obsidian and enable plugin
4. Start servers with `docker compose up -d`
5. Run "Whisper Voice Input: Toggle recording" from command palette

## Release

Uses [tagpr](https://github.com/Songmu/tagpr) for automated releases. BRAT requires `main.js` and `manifest.json` as release assets.

### How it works

1. Push/merge to `main` branch triggers tagpr
2. tagpr creates a release PR with version bump (minor by default)
3. Merge the release PR to create a GitHub release with assets

### Version bump control

- Default: minor version bump
- Add `major` label to release PR for major version bump
- Edit `.tagpr` to customize behavior

## Notes

- Recording format: `audio/webm` preferred (with fallback)
- Errors shown via Notice + console.error
- Simple recording flow: record → stop → transcribe → insert
