# Obsidian Whisper Voice Input Plugin

Whisper STTサーバーとOpenAI互換LLM APIを使用した音声入力プラグインです。Ollamaによる完全ローカル処理と、ローカルのCodex APIプロキシを選択できます。

## 機能

- 音声録音とローカルSTTサーバーによる文字起こし
- LLM（OpenAI互換API）による文字起こし結果の整形（オプション）
- 現在のエディタのカーソル位置にテキストを挿入

## サーバーセットアップ

Docker Composeで音声認識サーバーを起動:

```bash
docker compose up -d
```

**STT (faster-whisper-server)** が `http://localhost:2022/v1` で起動します。
LLMサーバーは、選択したものを別途起動してください。

### Codex local APIを使用する

[go-openai-api-server-via-codex](https://github.com/Konboi/go-openai-api-server-via-codex)を起動した後、プラグインの設定で次を選択します。

- **Server type**: **Codex local API**
- **Server**: `http://127.0.0.1:38180/v1`
- **Model**: **Fetch models**で取得するか、サーバーのモデル名を入力
- **API key**: サーバーを`--api-key`付きで起動した場合のみ入力

Codex local APIを選択すると、文字起こし結果はローカルプロキシ経由でCodexバックエンドへ送信されます。Vaultの他の内容は送信しません。

```bash
# STTサーバーを停止
docker compose down
```

> **Note**: Docker ComposeのWhisperはCPUで動作します。Apple Silicon MacでGPUを使用する場合は、[faster-whisper-server](https://github.com/fedirz/faster-whisper-server)をネイティブインストールしてください。

## インストール

### BRAT を使用（推奨）

1. [BRAT](https://github.com/TfTHacker/obsidian42-brat) プラグインをインストール
2. BRATの設定を開く
3. 「Add Beta plugin」をクリック
4. `Konboi/obsidian-whisper-voice-input-plugin` を入力
5. **設定 → コミュニティプラグイン** でプラグインを有効化

### 手動インストール

1. [Releases](https://github.com/Konboi/obsidian-whisper-voice-input-plugin/releases)から `main.js` と `manifest.json` をダウンロード
2. Vaultの `.obsidian/plugins/whisper-voice-input/` フォルダを作成
3. ダウンロードしたファイルをフォルダにコピー
4. Obsidianを再起動
5. **設定 → コミュニティプラグイン** でプラグインを有効化

## 使い方

1. コマンドパレット（`Cmd/Ctrl + P`）を開く
2. 「Whisper Voice Input: Toggle Recording」を実行
3. 録音が開始される（Notice表示）
4. 再度コマンドを実行して録音を停止
5. 自動的に文字起こしが行われ、カーソル位置に挿入される

## 設定項目

| 設定 | 説明 | デフォルト値 |
|------|------|-------------|
| STT Server URL | STTサーバーのベースURL | `http://127.0.0.1:2022/v1` |
| STT Model | Whisperモデル名 | `Systran/faster-whisper-small` |
| Mode | `Transcription only` または `Format with LLM` | `Transcription only` |
| Server type | `Ollama`、`Codex local API`、または`Custom` | `Ollama` |
| LLM Server URL | LLMサーバーのベースURL | `http://127.0.0.1:11434/v1` |
| LLM Model | LLMモデル名 | `gemma3:4b` |
| API key | LLMサーバーの任意のAPIキー | 空 |
| Formatting Prompt | LLM整形時のシステムプロンプト | （デフォルトの整形プロンプト） |

## トラブルシューティング

### マイク権限エラー

- Obsidian（またはElectron）にマイクへのアクセス権限を付与してください
- macOS: **システム設定 → プライバシーとセキュリティ → マイク** でObsidianを許可
- Windows: **設定 → プライバシー → マイク** でアプリのアクセスを許可

### STTサーバーに接続できない

- STTサーバーが起動していることを確認
- 設定のSTT Server URLが正しいことを確認
- ファイアウォールがローカル接続をブロックしていないか確認

### 音声形式の不一致

このプラグインは `audio/webm` 形式で録音します。STTサーバーがwebmをサポートしていない場合:

- whisper.cppを使用している場合、ffmpegが必要な場合があります
- サーバー側でwebm→wav変換が必要な場合があります

### エディタが選択されていない

文字起こし結果を挿入するには、Markdownファイルを開いてエディタにフォーカスしている必要があります。

### LLM整形が失敗する

- LLMサーバーが起動していることを確認
- モデルがロードされていることを確認
- 設定のLLM Server URLが正しいことを確認

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
