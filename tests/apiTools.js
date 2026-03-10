import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function run() {
    const transport = new StdioClientTransport({
        command: "node",
        args: ["dist/index.js"],
    });

    const client = new Client(
        {
            name: "wenyan-client-test",
            version: "1.0.0",
        },
        {
            capabilities: {},
        },
    );

    try {
        await client.connect(transport);

        const tools = await client.listTools();
        const toolNames = new Set(tools.tools.map((tool) => tool.name));
        assert.equal(toolNames.has("list_wechat_api_endpoints"), true);
        assert.equal(toolNames.has("list_client_publish_api_endpoints"), true);

        const wechatApiResult = await client.callTool({ name: "list_wechat_api_endpoints", arguments: {} });
        const wechatEndpoints = JSON.parse(wechatApiResult.content[0].text);
        assert.deepEqual(wechatEndpoints, {
            token: "https://api.weixin.qq.com/cgi-bin/token",
            publishDraft: "https://api.weixin.qq.com/cgi-bin/draft/add",
            uploadMaterial: "https://api.weixin.qq.com/cgi-bin/material/add_material",
        });

        const clientApiResult = await client.callTool({ name: "list_client_publish_api_endpoints", arguments: {} });
        const clientEndpoints = JSON.parse(clientApiResult.content[0].text);
        assert.deepEqual(clientEndpoints, {
            health: "/health",
            verify: "/verify",
            upload: "/upload",
            publish: "/publish",
        });

        console.log("API tools test passed.");
    } finally {
        await transport.close();
    }
}

run().catch((error) => {
    console.error(error);
    process.exit(1);
});
