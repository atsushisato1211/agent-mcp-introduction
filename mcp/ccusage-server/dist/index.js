#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const child_process_1 = require("child_process");
const server = new index_js_1.Server({
    name: "ccusage-server",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
    },
});
server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
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
server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
    if (request.params.name !== "run_ccusage") {
        throw new types_js_1.McpError(types_js_1.ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
    }
    const args = request.params.arguments?.args || [];
    return new Promise((resolve, reject) => {
        let output = "";
        let errorOutput = "";
        const ccusageProcess = (0, child_process_1.spawn)("npx", ["ccusage@latest", ...args], {
            shell: true,
            cwd: process.cwd(),
        });
        ccusageProcess.stdout.on("data", (data) => {
            output += data.toString();
        });
        ccusageProcess.stderr.on("data", (data) => {
            errorOutput += data.toString();
        });
        ccusageProcess.on("close", (code) => {
            if (code === 0) {
                resolve({
                    content: [
                        {
                            type: "text",
                            text: output,
                        },
                    ],
                });
            }
            else {
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
        ccusageProcess.on("error", (error) => {
            reject(new types_js_1.McpError(types_js_1.ErrorCode.InternalError, `Failed to run ccusage: ${error.message}`));
        });
    });
});
async function main() {
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    console.error("ccusage MCP server started");
}
main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map