# Google Search MCP Server

Gemini APIを使用してGoogle検索を実行するMCP (Model Context Protocol) サーバーです。

## 概要

このMCPサーバーは、Google AI StudioのAPIを使用してGemini APIのGrounding with Google Search機能を提供します。Claude DesktopやClaude Codeなどのクライアントから、Web検索機能を利用できるようになります。

## 機能

- Gemini APIのGrounding with Google Search機能による高精度な検索
- 複数のGeminiモデルから選択可能
- 最新の情報にアクセス可能
- Markdown形式での回答と引用リンク付き

## 必要条件

- Node.js 18以上
- Google AI Studio APIキー（[Google AI Studio](https://aistudio.google.com/apikey)から取得）

## セットアップ

### 1. インストール

```bash
cd mcp/google-search-server
npm install
```

### 2. 環境変数の設定

環境変数を設定します：

```env
GEMINI_API_KEY=your-actual-api-key
GEMINI_MODEL=gemini-2.5-flash  # オプション（デフォルト）
```

利用可能なモデル:
- `gemini-2.5-pro` - 最も高性能なモデル
- `gemini-2.5-flash` (デフォルト) - 高速でバランスの取れたモデル
- `gemini-2.5-flash-lite` - より軽量で高速なモデル
- `gemini-2.0-flash` - 前世代の高速モデル
- `gemini-2.0-flash-lite` - 前世代の軽量モデル

### 3. ビルド

```bash
npm run build
```

## 起動方法

### 開発モード

```bash
npm run dev
```

### 本番モード

```bash
npm start
```

## Claude CodeへのMCP登録

### 登録方法

`claude mcp add`コマンドを使用してMCPサーバーを登録します。環境変数は`-e`オプションで直接指定できます：

```bash
# プロジェクトのルートディレクトリから実行
claude mcp add google-search \
  -s user \
  -e GEMINI_API_KEY="your-api-key-here" \
  -e GEMINI_MODEL="gemini-2.5-flash" \
  -- npx tsx /path/to/mcp/google-search-server/src/index.ts
```

### 手動設定（オプション）

手動で設定ファイル（`~/.claude/claude_desktop_config.json`）を編集することも可能です：

```json
{
  "mcpServers": {
    "google-search": {
      "command": "node",
      "args": ["/path/to/your/project/mcp/google-search-server/dist/index.js"],
      "env": {
        "GEMINI_API_KEY": "your-api-key-here",
        "GEMINI_MODEL": "gemini-2.5-flash"
      }
    }
  }
}
```

## 使用方法

Claude Code内で以下のように使用できます：

```
「最新のTypeScript 5.7の新機能について調べてください」
「Next.js 15のリリース情報を検索してください」

```

検索結果はMarkdown形式で整形され、参照元のリンクも含まれます。

## 提供されるツール

### `google_search`

Web検索を実行し、結果を返します。

**パラメータ:**
- `query` (string, 必須): 検索クエリ

**注意:** 使用するGeminiモデルは環境変数 `GEMINI_MODEL` で設定します。

