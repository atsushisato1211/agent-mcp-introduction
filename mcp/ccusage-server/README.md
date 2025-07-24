# CCUsage MCP Server

このMCPサーバーは `ccusage` コマンドを実行してClaude Codeの使用量を分析するためのツールです。

## 機能

- Claude Codeの使用量とコストを分析
- 日次、月次、セッション単位での使用量レポート
- モデル別のコスト内訳表示
- リアルタイム使用量ダッシュボード

## インストール

```bash
npm install
npm run build
```

## 設定方法

### Claude Code での設定

Claude Codeでこのサーバーを使用するには、以下のコマンドを実行してください：

```bash
claude mcp add ccusage-server -s user -- npx tsx /path/to/mcp/ccusage-server/src/index.ts
```

実際のパス例：
```bash
claude mcp add ccusage-server -s user -- npx tsx /Users/atsushi.sato/Workspace/agent-mcp-introduction/mcp/ccusage-server/src/index.ts
```

### Claude Desktop での設定

Claude Desktopで使用する場合は、MCP設定にサーバーを追加してください：

```json
{
  "mcpServers": {
    "ccusage-server": {
      "command": "node",
      "args": ["/path/to/ccusage-server/dist/index.js"]
    }
  }
}
```

## 利用可能なツール

- `run_ccusage`: ccusageコマンドを実行して使用量を分析
  - `command`: 実行するコマンド（daily, monthly, session, blocks）
  - `breakdown`: モデル別コスト内訳を表示
  - `instances`: プロジェクト/インスタンス別にグループ化
  - `json`: JSON形式で出力
  - `project`: 特定のプロジェクトでフィルタ
  - `since`: 開始日フィルタ（YYYYMMDD形式）
  - `until`: 終了日フィルタ（YYYYMMDD形式）

## Development

```bash
npm run dev    # Run with tsx for development
npm run build  # Build TypeScript
npm start      # Run compiled version
```