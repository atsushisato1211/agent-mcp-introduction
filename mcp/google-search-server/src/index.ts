#!/usr/bin/env node
import 'dotenv/config';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  McpError,
  ErrorCode,
} from '@modelcontextprotocol/sdk/types.js';
import { createGoogleSearchAI, searchGoogle } from './tools/googleSearch.js';

// ─── MCP Server 定義 ───────────────────────────────
const server = new Server(
  { name: 'google-search-server', version: '0.1.0' },
  { capabilities: { tools: {} } },
);

// モデル名のバリデーション
const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const VALID_MODELS = [
  'gemini-2.5-pro',
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite'
];
if (!VALID_MODELS.includes(MODEL_NAME)) {
  console.error(`Error: Invalid model name: ${MODEL_NAME}. Valid models are: ${VALID_MODELS.join(', ')}`);
  process.exit(1);
}

const ai = createGoogleSearchAI();

// ListTools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'google_search',
      description:
        'Performs a web search using Google Search (via the Gemini API) and returns the results. This tool is useful for finding information on the internet based on a query.',
      inputSchema: {
        type: 'object',
        properties: { 
          query: { 
            type: 'string', 
            description: 'The search query to find information on the web.' 
          } 
        },
        required: ['query'],
      },
    },
  ],
}));

// CallTool
server.setRequestHandler(CallToolRequestSchema, async ({ params }) => {
  if (params.name !== 'google_search')
    throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${params.name}`);

  const { query } = params.arguments as { query?: unknown };
  if (typeof query !== 'string')
    throw new McpError(ErrorCode.InvalidParams, '`query` must be string');

  try {
    const result = await searchGoogle(ai, { query });
    return { 
      content: result.content,
    };
  } catch (err) {
    throw new McpError(
      ErrorCode.InternalError,
      `Error performing search: ${(err as Error).message}`,
    );
  }
});

// ─── 起動 ───────────────────────────────────────────
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`Google Search MCP server running on stdio with model: ${MODEL_NAME}`);
}

main().catch(console.error);