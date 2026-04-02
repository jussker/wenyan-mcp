import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { LIST_THEMES_SCHEMA, REGISTER_THEME_SCHEMA, REMOVE_THEME_SCHEMA } from "./theme.js";
import { CREATE_DRAFT_SCHEMA, createDraft } from "./publish.js";
import pkg from "../package.json" with { type: "json" };
import { buildMcpResponse, globalStates } from "./utils.js";
import { addTheme, listThemes, removeTheme } from "@wenyan-md/core/wrapper";
import {
    deleteDraft,
    deleteMaterial,
    deletePublished,
    getDraft,
    getPublishStatus,
    listDrafts,
    listMaterials,
    listPublished,
    publishDraft,
    uploadMaterial,
    WECHAT_DELETE_DRAFT_SCHEMA,
    WECHAT_DELETE_MATERIAL_SCHEMA,
    WECHAT_DELETE_PUBLISHED_SCHEMA,
    WECHAT_GET_DRAFT_SCHEMA,
    WECHAT_GET_PUBLISH_STATUS_SCHEMA,
    WECHAT_LIST_DRAFTS_SCHEMA,
    WECHAT_LIST_MATERIALS_SCHEMA,
    WECHAT_LIST_PUBLISHED_SCHEMA,
    WECHAT_PUBLISH_DRAFT_SCHEMA,
    WECHAT_UPLOAD_MATERIAL_SCHEMA,
} from "./wechat.js";

/**
 * Create and configure an MCP server instance.
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

    /**
     * MCP 工具目录。
     *
     * @remarks
     * 工具按用户故事分组：
     * - 素材管理：上传、查询列表、删除
     * - 草稿管理：查询列表、查看详情、删除
     * - 发布能力：提交发布、查询状态、删除已发布文章
     */
    server.setRequestHandler(ListToolsRequestSchema, async () => {
        return {
            tools: [
                CREATE_DRAFT_SCHEMA,
                LIST_THEMES_SCHEMA,
                REGISTER_THEME_SCHEMA,
                REMOVE_THEME_SCHEMA,
                WECHAT_UPLOAD_MATERIAL_SCHEMA,
                WECHAT_LIST_MATERIALS_SCHEMA,
                WECHAT_DELETE_MATERIAL_SCHEMA,
                WECHAT_LIST_DRAFTS_SCHEMA,
                WECHAT_GET_DRAFT_SCHEMA,
                WECHAT_DELETE_DRAFT_SCHEMA,
                WECHAT_PUBLISH_DRAFT_SCHEMA,
                WECHAT_GET_PUBLISH_STATUS_SCHEMA,
                WECHAT_LIST_PUBLISHED_SCHEMA,
                WECHAT_DELETE_PUBLISHED_SCHEMA,
            ],
        };
    });

    /**
     * MCP 工具调用分发器。
     */
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        try {
            if (request.params.name === "create_draft") {
                if (globalStates.isClientMode && !globalStates.serverUrl) {
                    throw new Error("Missing server URL. Usage: --server <server_url>");
                }
                const args = request.params.arguments || {};
                const content = String(args.content || "");
                const contentUrl = String(args.content_url || "");
                const file = String(args.file || "");
                const themeId = String(args.theme_id || "");
                const contentBaseDir = String(args.content_base_dir || "");
                const mermaid = typeof args.mermaid === "boolean" ? args.mermaid : undefined;
                const mermaidPpi = typeof args.mermaid_ppi === "number" ? args.mermaid_ppi : undefined;
                const mermaidRenderScale =
                    typeof args.mermaid_render_scale === "number" ? args.mermaid_render_scale : undefined;
                return await createDraft(contentUrl, file, content, themeId, pkg.version, {
                    contentBaseDir,
                    mermaid,
                    mermaidPpi,
                    mermaidRenderScale,
                });
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
            } else if (request.params.name === "wechat_upload_material") {
                const args = request.params.arguments || {};
                return await uploadMaterial(
                    String(args.type || ""),
                    String(args.file_path || ""),
                    args.filename ? String(args.filename) : undefined,
                    args.access_token ? String(args.access_token) : undefined,
                    args.app_id ? String(args.app_id) : undefined,
                    args.app_secret ? String(args.app_secret) : undefined,
                );
            } else if (request.params.name === "wechat_list_materials") {
                const args = request.params.arguments || {};
                return await listMaterials(
                    String(args.type || "news"),
                    Number(args.offset || 0),
                    Number(args.count || 20),
                    args.access_token ? String(args.access_token) : undefined,
                    args.app_id ? String(args.app_id) : undefined,
                    args.app_secret ? String(args.app_secret) : undefined,
                );
            } else if (request.params.name === "wechat_delete_material") {
                const args = request.params.arguments || {};
                return await deleteMaterial(
                    String(args.media_id || ""),
                    args.access_token ? String(args.access_token) : undefined,
                    args.app_id ? String(args.app_id) : undefined,
                    args.app_secret ? String(args.app_secret) : undefined,
                );
            } else if (request.params.name === "wechat_list_drafts") {
                const args = request.params.arguments || {};
                return await listDrafts(
                    Number(args.offset || 0),
                    Number(args.count || 20),
                    Number(args.no_content || 0),
                    args.access_token ? String(args.access_token) : undefined,
                    args.app_id ? String(args.app_id) : undefined,
                    args.app_secret ? String(args.app_secret) : undefined,
                );
            } else if (request.params.name === "wechat_get_draft") {
                const args = request.params.arguments || {};
                return await getDraft(
                    String(args.media_id || ""),
                    args.access_token ? String(args.access_token) : undefined,
                    args.app_id ? String(args.app_id) : undefined,
                    args.app_secret ? String(args.app_secret) : undefined,
                );
            } else if (request.params.name === "wechat_delete_draft") {
                const args = request.params.arguments || {};
                return await deleteDraft(
                    String(args.media_id || ""),
                    args.access_token ? String(args.access_token) : undefined,
                    args.app_id ? String(args.app_id) : undefined,
                    args.app_secret ? String(args.app_secret) : undefined,
                );
            } else if (request.params.name === "wechat_publish_draft") {
                const args = request.params.arguments || {};
                return await publishDraft(
                    String(args.media_id || ""),
                    args.access_token ? String(args.access_token) : undefined,
                    args.app_id ? String(args.app_id) : undefined,
                    args.app_secret ? String(args.app_secret) : undefined,
                );
            } else if (request.params.name === "wechat_get_publish_status") {
                const args = request.params.arguments || {};
                return await getPublishStatus(
                    String(args.publish_id || ""),
                    args.access_token ? String(args.access_token) : undefined,
                    args.app_id ? String(args.app_id) : undefined,
                    args.app_secret ? String(args.app_secret) : undefined,
                );
            } else if (request.params.name === "wechat_list_published") {
                const args = request.params.arguments || {};
                return await listPublished(
                    Number(args.offset || 0),
                    Number(args.count || 20),
                    args.access_token ? String(args.access_token) : undefined,
                    args.app_id ? String(args.app_id) : undefined,
                    args.app_secret ? String(args.app_secret) : undefined,
                );
            } else if (request.params.name === "wechat_delete_published") {
                const args = request.params.arguments || {};
                return await deletePublished(
                    String(args.article_id || ""),
                    args.access_token ? String(args.access_token) : undefined,
                    args.app_id ? String(args.app_id) : undefined,
                    args.app_secret ? String(args.app_secret) : undefined,
                );
            }

            throw new Error("Unknown tool");
        } catch (error: any) {
            console.error(`[MCP Tool Error] (${request.params.name}):`, error.message);
            return buildMcpResponse(`执行工具失败: ${error.message}`);
        }
    });

    return server;
}
