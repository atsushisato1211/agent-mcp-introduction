#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { spawn } from "child_process";

const server = new Server(
  {
    name: "ccusage-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "run_ccusage",
        description: "Run 'npx ccusage@latest' command to analyze code usage",
        inputSchema: {
          type: "object",
          properties: {
            args: {
              type: "array",
              items: {
                type: "string",
              },
              description: "Additional arguments to pass to ccusage",
              default: [],
            },
          },
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== "run_ccusage") {
    throw new McpError(
      ErrorCode.MethodNotFound,
      `Unknown tool: ${request.params.name}`
    );
  }

  const args = (request.params.arguments?.args as string[]) || [];

  return new Promise((resolve, reject) => {
    let output = "";
    let errorOutput = "";

    const ccusageProcess = spawn("npx", ["ccusage@latest", ...args], {
      shell: true,
      cwd: process.cwd(),
    });

    ccusageProcess.stdout.on("data", (data: Buffer) => {
      output += data.toString();
    });

    ccusageProcess.stderr.on("data", (data: Buffer) => {
      errorOutput += data.toString();
    });

    ccusageProcess.on("close", (code: number | null) => {
      if (code === 0) {
        resolve({
          content: [
            {
              type: "text",
              text: output,
            },
          ],
        });
      } else {
        resolve({
          content: [
            {
              type: "text",
              text: `Error running ccusage:\n${errorOutput}`,
            },
          ],
          isError: true,
        });
      }
    });

    ccusageProcess.on("error", (error: Error) => {
      reject(
        new McpError(
          ErrorCode.InternalError,
          `Failed to run ccusage: ${error.message}`
        )
      );
    });
  });
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("ccusage MCP server started");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});