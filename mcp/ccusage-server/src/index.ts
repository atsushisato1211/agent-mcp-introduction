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
    version: "1.1.0",
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
        description: "Run ccusage command to analyze code usage",
        inputSchema: {
          type: "object",
          properties: {
            command: {
              type: "string",
              description: "ccusage command type",
              enum: ["daily", "monthly", "session", "blocks"],
              default: "daily",
            },
            since: {
              type: "string",
              description: "Start date filter (YYYYMMDD format)",
            },
            until: {
              type: "string",
              description: "End date filter (YYYYMMDD format)",
            },
            project: {
              type: "string",
              description: "Filter by specific project",
            },
            json: {
              type: "boolean",
              description: "Output in JSON format",
              default: false,
            },
            breakdown: {
              type: "boolean",
              description: "Show per-model cost breakdown",
              default: false,
            },
            instances: {
              type: "boolean",
              description: "Group by project/instance",
              default: false,
            },
            live: {
              type: "boolean",
              description: "Real-time usage dashboard (only for blocks command)",
              default: false,
            },
            offline: {
              type: "boolean",
              description: "Use offline mode",
              default: false,
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

  const params = request.params.arguments as any || {};
  const command = params.command || "daily";
  const args: string[] = [command];

  if (params.since) args.push("--since", params.since as string);
  if (params.until) args.push("--until", params.until as string);
  if (params.project) args.push("--project", params.project as string);
  if (params.json) args.push("--json");
  if (params.breakdown) args.push("--breakdown");
  if (params.instances) args.push("--instances");
  if (params.live && command === "blocks") args.push("--live");
  if (params.offline) args.push("--offline");

  return new Promise((resolve, reject) => {
    let output = "";
    let errorOutput = "";

    const ccusageProcess = spawn("bunx", ["ccusage", ...args], {
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