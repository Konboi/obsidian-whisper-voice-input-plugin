# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Obsidian voice input plugin. Uses local STT server and LM Studio to convert speech to text and insert into editor.

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

### Recording Flow (WebSocket)
1. `toggleRecording()` - Toggle recording start/stop
2. `startRecording()` - Connect WebSocket, start MediaRecorder
3. `handleTranscriptionResult()` - Process incoming transcription
4. `stopRecording()` - Stop recording, close WebSocket

### API Endpoints
- STT WebSocket: `ws://{sttBaseUrl}/audio/transcriptions`
- LLM: `POST {lmBaseUrl}/chat/completions` (JSON: model, messages, temperature)

### Settings
- `sttBaseUrl`: STT server URL (default: `http://127.0.0.1:2022/v1`)
- `lmBaseUrl`: LM Studio URL (default: `http://localhost:1234/v1`)
- `lmModel`: LLM model name
- `mode`: `transcript-only` | `llm-format`
- `systemPrompt`: LLM formatting prompt

## Testing

1. Build with `npm run build`
2. Copy `main.js` and `manifest.json` to `<Vault>/.obsidian/plugins/voice-input/`
3. Restart Obsidian and enable plugin
4. Start STT server (e.g., faster-whisper-server)
5. Run "Voice Input: Toggle Recording" from command palette

## Notes

- Recording format: `audio/webm` preferred (with fallback)
- Errors shown via Notice + console.error
- Real-time transcription via WebSocket streaming
