import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const REQUIRED_TOOLS = [
    "publish_article",
    "list_themes",
    "register_theme",
    "remove_theme",
    "wechat_upload_material",
    "wechat_list_materials",
    "wechat_delete_material",
    "wechat_list_drafts",
    "wechat_get_draft",
    "wechat_delete_draft",
    "wechat_publish_draft",
    "wechat_get_publish_status",
    "wechat_list_published",
    "wechat_delete_published",
];

async function run() {
    const transport = new StdioClientTransport({
        command: "node",
        args: ["dist/index.js"],
    });

    const client = new Client(
        {
            name: "wenyan-tools-test-client",
            version: "1.0.0",
        },
        {
            capabilities: {},
        },
    );

    try {
        await client.connect(transport);
        const mcpResponse = await client.listTools();
        const names = new Set(mcpResponse.tools.map((tool) => tool.name));
        for (const toolName of REQUIRED_TOOLS) {
            assert.ok(names.has(toolName), `missing expected tool: ${toolName}`);
        }
        console.log(`Tool listing test passed. Total tools: ${mcpResponse.tools.length}`);
    } finally {
        await transport.close();
    }
}

run().catch((error) => {
    console.error("Tool listing test failed:", error);
    process.exit(1);
});
