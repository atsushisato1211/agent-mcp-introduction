# CCUsage MCP Server

This MCP server runs `npx ccusage@latest` to analyze code usage.

## Installation

```bash
npm install
npm run build
```

## Usage

Configure this server in your MCP client (like Claude Desktop) by adding it to the MCP configuration:

```json
{
  "mcpServers": {
    "ccusage": {
      "command": "node",
      "args": ["/path/to/ccusage-server/dist/index.js"]
    }
  }
}
```

## Available Tools

- `run_ccusage`: Runs `npx ccusage@latest` with optional arguments
  - `args`: Array of additional arguments to pass to ccusage

## Development

```bash
npm run dev    # Run with tsx for development
npm run build  # Build TypeScript
npm start      # Run compiled version
```