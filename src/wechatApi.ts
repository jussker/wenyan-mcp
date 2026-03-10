import { buildMcpResponse } from "./utils.js";

const WECHAT_API_ENDPOINTS = {
    token: "https://api.weixin.qq.com/cgi-bin/token",
    publishDraft: "https://api.weixin.qq.com/cgi-bin/draft/add",
    uploadMaterial: "https://api.weixin.qq.com/cgi-bin/material/add_material",
} as const;

const CLIENT_PUBLISH_API_ENDPOINTS = {
    health: "/health",
    verify: "/verify",
    upload: "/upload",
    publish: "/publish",
} as const;

/**
 * MCP tool schema for listing official WeChat publish API endpoints.
 *
 * @remarks
 * Response format:
 * `{ "token": string, "publishDraft": string, "uploadMaterial": string }`
 */
export const LIST_WECHAT_API_ENDPOINTS_SCHEMA = {
    name: "list_wechat_api_endpoints",
    description: "List WeChat official API endpoints used by Wenyan for token, material upload, and draft publishing.",
    inputSchema: {
        type: "object",
        properties: {},
    },
} as const;

/**
 * MCP tool schema for listing Wenyan client-server publish endpoints.
 *
 * @remarks
 * Response format:
 * `{ "health": string, "verify": string, "upload": string, "publish": string }`
 */
export const LIST_CLIENT_PUBLISH_API_ENDPOINTS_SCHEMA = {
    name: "list_client_publish_api_endpoints",
    description: "List Wenyan client-server endpoints for health check, auth verify, content upload, and publish.",
    inputSchema: {
        type: "object",
        properties: {},
    },
} as const;

export function listWechatApiEndpoints() {
    return buildMcpResponse(JSON.stringify(WECHAT_API_ENDPOINTS));
}

export function listClientPublishApiEndpoints() {
    return buildMcpResponse(JSON.stringify(CLIENT_PUBLISH_API_ENDPOINTS));
}
