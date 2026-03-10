import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { LIST_THEMES_SCHEMA, REGISTER_THEME_SCHEMA, REMOVE_THEME_SCHEMA } from "./theme.js";
import { PUBLISH_ARTICLE_SCHEMA, publishArticle } from "./publish.js";
import {
    LIST_CLIENT_PUBLISH_API_ENDPOINTS_SCHEMA,
    LIST_WECHAT_API_ENDPOINTS_SCHEMA,
    listClientPublishApiEndpoints,
    listWechatApiEndpoints,
} from "./wechatApi.js";
import pkg from "../package.json" with { type: "json" };
import { buildMcpResponse, globalStates } from "./utils.js";
import { addTheme, listThemes, removeTheme } from "@wenyan-md/core/wrapper";

/**
 * Create and configure the MCP server instance.
 *
 * @remarks
 * MCP request lifecycle in this project:
 * - `ListToolsRequestSchema`: exposes tool schemas to MCP clients
 * - `CallToolRequestSchema`: validates/runs tool handlers and returns text responses
 */
export function createServer(): Server {
    const server = new Server(
        {
            name: "wenyan-mcp",
            version: pkg.version,
        },
        {
            capabilities: {
                resources: {},
                tools: {},
                prompts: {},
                // logging: {},
            },
        },
    );

    server.setRequestHandler(ListToolsRequestSchema, async () => {
        return {
            tools: [
                PUBLISH_ARTICLE_SCHEMA,
                LIST_THEMES_SCHEMA,
                REGISTER_THEME_SCHEMA,
                REMOVE_THEME_SCHEMA,
                LIST_WECHAT_API_ENDPOINTS_SCHEMA,
                LIST_CLIENT_PUBLISH_API_ENDPOINTS_SCHEMA,
            ],
        };
    });

    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        try {
            if (request.params.name === "publish_article") {
                if (globalStates.isClientMode && !globalStates.serverUrl) {
                    throw new Error("Missing server URL. Usage: --server <server_url>");
                }
                const args = request.params.arguments || {};
                const content = String(args.content || "");
                const contentUrl = String(args.content_url || "");
                const file = String(args.file || "");
                const themeId = String(args.theme_id || "");
                return await publishArticle(contentUrl, file, content, themeId, pkg.version);
            } else if (request.params.name === "list_themes") {
                const themes = await listThemes();
                const builtinThemes = themes.filter((theme) => theme.isBuiltin);
                const customThemes = themes.filter((theme) => !theme.isBuiltin);
                return {
                    content: [
                        ...builtinThemes.map((theme) => ({
                            type: "text",
                            text: JSON.stringify({
                                id: theme.id,
                                name: theme.name,
                                description: theme.description,
                            }),
                        })),
                        ...customThemes.map((theme) => ({
                            type: "text",
                            text: JSON.stringify({
                                id: theme.id,
                                name: theme.name ?? theme.id,
                                description: theme.description ?? "自定义主题，暂无描述。",
                            }),
                        })),
                    ],
                };
            } else if (request.params.name === "register_theme") {
                const name = String(request.params.arguments?.name || "");
                const path = String(request.params.arguments?.path || "");
                await addTheme(name, path);
                return buildMcpResponse(`Theme "${name}" has been added successfully.`);
            } else if (request.params.name === "remove_theme") {
                const name = String(request.params.arguments?.name || "");
                await removeTheme(name);
                return buildMcpResponse(`Theme "${name}" has been removed successfully.`);
            } else if (request.params.name === "list_wechat_api_endpoints") {
                return listWechatApiEndpoints();
            } else if (request.params.name === "list_client_publish_api_endpoints") {
                return listClientPublishApiEndpoints();
            }

            throw new Error("Unknown tool");
        } catch (error: any) {
            console.error(`[MCP Tool Error] (${request.params.name}):`, error.message);
            return buildMcpResponse(`执行工具失败: ${error.message}`);
        }
    });

    return server;
}
