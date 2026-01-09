# Obsidian Voice Input Plugin

ローカルSTTサーバーとLM Studioを使用した音声入力プラグインです。クラウドAPIを使用せず、完全にローカルで動作します。

## 機能

- 音声録音とローカルSTTサーバーによる文字起こし
- LM Studio（OpenAI互換API）による文字起こし結果の整形（オプション）
- 現在のエディタのカーソル位置にテキストを挿入

## 必要なローカルサーバー

### STTサーバー

OpenAI Whisper互換のAPIエンドポイントを提供するローカルSTTサーバーが必要です。

- デフォルトURL: `http://127.0.0.1:2022/v1`
- エンドポイント: `POST /audio/transcriptions`

例:
- [whisper.cpp](https://github.com/ggerganov/whisper.cpp) のサーバーモード
- [faster-whisper-server](https://github.com/fedirz/faster-whisper-server)

### LM Studio（オプション）

LLM整形モードを使用する場合、LM Studioが必要です。

- デフォルトURL: `http://localhost:1234/v1`
- エンドポイント: `POST /chat/completions`
- LM Studioでローカルサーバーを起動してください

### Apple Silicon Mac（M1/M2/M3/M4）推奨セットアップ

DockerではMetal GPUを使用できないため、ネイティブインストールを推奨します。

#### Ollama（LLM - Metal GPU使用）

```bash
brew install ollama
ollama serve &
ollama pull gemma2:2b
```

- URL: `http://localhost:11434/v1`
- プラグイン設定の「LM Studio Base URL」を上記に変更
- 「LM Model」を `gemma2:2b` に変更

#### Whisper（STT - Metal GPU使用）

```bash
pip install 'mlx-whisper[server]'
mlx_whisper.server --port 2022
```

または faster-whisper-server:

```bash
pip install faster-whisper-server
faster-whisper-server --port 2022
```

### Docker Compose（CPU版）

GPUを使わない場合、Docker ComposeでSTTサーバーを起動できます。

```bash
docker compose up -d
```

- **STT (faster-whisper-server)**: `http://localhost:2022/v1`

```bash
# 停止
docker compose down
```

## インストール

### ビルド

```bash
npm install
npm run build
```

### Obsidianへの配置

1. Vaultの `.obsidian/plugins/voice-input/` フォルダを作成
2. 以下のファイルをコピー:
   - `main.js`
   - `manifest.json`
3. Obsidianを再起動
4. **設定 → コミュニティプラグイン** でプラグインを有効化

## 使い方

1. コマンドパレット（`Cmd/Ctrl + P`）を開く
2. 「Voice Input: Toggle Recording」を実行
3. 録音が開始される（Notice表示）
4. 再度コマンドを実行して録音を停止
5. 自動的に文字起こしが行われ、カーソル位置に挿入される

## 設定項目

| 設定 | 説明 | デフォルト値 |
|------|------|-------------|
| STT Base URL | STTサーバーのベースURL | `http://127.0.0.1:2022/v1` |
| LM Studio Base URL | LM StudioのベースURL | `http://localhost:1234/v1` |
| LM Model | 使用するLMモデル名 | `default` |
| Mode | `Transcription only` または `Format with LLM` | `Transcription only` |
| System Prompt | LLM整形時のシステムプロンプト | （日本語整形用プロンプト） |

## トラブルシューティング

### マイク権限エラー

- Obsidian（またはElectron）にマイクへのアクセス権限を付与してください
- macOS: **システム設定 → プライバシーとセキュリティ → マイク** でObsidianを許可
- Windows: **設定 → プライバシー → マイク** でアプリのアクセスを許可

### STTサーバーに接続できない

- STTサーバーが起動していることを確認
- 設定のSTT Base URLが正しいことを確認
- ファイアウォールがローカル接続をブロックしていないか確認

### 音声形式の不一致

このプラグインは `audio/webm` 形式で録音します。STTサーバーがwebmをサポートしていない場合:

- whisper.cppを使用している場合、ffmpegが必要な場合があります
- サーバー側でwebm→wav変換が必要な場合があります

### エディタが選択されていない

文字起こし結果を挿入するには、Markdownファイルを開いてエディタにフォーカスしている必要があります。

### LLM整形が失敗する

- LM Studioが起動していてローカルサーバーが有効になっていることを確認
- モデルがロードされていることを確認
- 設定のLM Studio Base URLが正しいことを確認

LLM整形が失敗した場合、文字起こし結果がそのまま挿入されます。

### CORSエラー

ローカルサーバーがCORSヘッダーを返していない場合、エラーが発生することがあります。サーバー側でCORSを有効にしてください。

## 開発

```bash
# 開発モード（ファイル変更を監視）
npm run dev

# 本番ビルド
npm run build

# Lint
npm run lint
```

## ライセンス

0-BSD
