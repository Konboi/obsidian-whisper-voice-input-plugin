# Obsidian Whisper Voice Input Plugin

ローカルWhisper STTサーバーとLLMを使用した音声入力プラグインです。クラウドAPIを使用せず、完全にローカルで動作します。

## 機能

- 音声録音とローカルSTTサーバーによる文字起こし
- LLM（OpenAI互換API）による文字起こし結果の整形（オプション）
- 現在のエディタのカーソル位置にテキストを挿入

## サーバーセットアップ

Docker Composeで必要なサーバーを起動:

```bash
docker compose up -d
```

起動するサービス:
- **STT (faster-whisper-server)**: `http://localhost:2022/v1`
- **LLM (Ollama)**: `http://localhost:11434/v1`

```bash
# 停止
docker compose down
```

> **Note**: DockerはCPUのみで動作します。Apple Silicon MacでGPUを使用する場合は、[Ollama](https://ollama.ai)と[faster-whisper-server](https://github.com/fedirz/faster-whisper-server)をネイティブインストールしてください。

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
| LLM Server URL | LLMサーバーのベースURL | `http://localhost:1234/v1` |
| LLM Model | LLMモデル名 | `gemma2:2b` |
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
