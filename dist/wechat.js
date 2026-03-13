import fs from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { FormDataEncoder } from "form-data-encoder";
import { FormData } from "formdata-node";
import { createWechatClient } from "@wenyan-md/core/wechat";
import { buildMcpResponse } from "./utils.js";
const nodeHttpAdapter = {
    fetch: (input, init) => fetch(input, init),
    createMultipart(field, file, filename) {
        const formData = new FormData();
        formData.append(field, file, filename);
        const encoder = new FormDataEncoder(formData);
        return {
            body: Readable.from(encoder),
            headers: encoder.headers,
        };
    },
};
const wechatClient = createWechatClient(nodeHttpAdapter);
const typedWechatClient = wechatClient;
/**
 * MCP 工具：上传永久素材。
 *
 * @remarks
 * `file_path` 格式 SPEC：
 * - 可以是绝对路径（如 `/home/runner/work/wenyan-mcp/wenyan-mcp/tests/wenyan.jpg`）
 * - 也可以是相对路径（相对 `process.cwd()`）
 * - 指向已存在文件；文件名将默认使用路径 basename（可被 `filename` 覆盖）
 */
export const WECHAT_UPLOAD_MATERIAL_SCHEMA = {
    name: "wechat_upload_material",
    description: "素材管理：上传公众号永久素材并返回 media_id。",
    inputSchema: {
        type: "object",
        properties: {
            type: {
                type: "string",
                description: "素材类型，常见值：image、voice、video、thumb。",
            },
            file_path: {
                type: "string",
                description: "本地素材文件路径。SPEC: 允许绝对路径或相对路径（相对 process.cwd()），且必须是可读取的已有文件。",
            },
            filename: {
                type: "string",
                description: "上传到微信端使用的文件名；不传时默认取 file_path 的 basename。",
            },
            access_token: {
                type: "string",
                description: "可选。微信 access_token；不传则自动通过 app_id/app_secret 或环境变量获取。",
            },
            app_id: {
                type: "string",
                description: "可选。微信 appid；未传时回退到环境变量 WECHAT_APP_ID。",
            },
            app_secret: {
                type: "string",
                description: "可选。微信 secret；未传时回退到环境变量 WECHAT_APP_SECRET。",
            },
        },
        required: ["type", "file_path"],
    },
};
/**
 * MCP 工具：获取永久素材列表。
 */
export const WECHAT_LIST_MATERIALS_SCHEMA = {
    name: "wechat_list_materials",
    description: "素材管理：分页获取公众号永久素材列表。",
    inputSchema: {
        type: "object",
        properties: {
            type: {
                type: "string",
                description: "素材类型，常见值：news、image、voice、video。",
            },
            offset: {
                type: "number",
                description: "分页偏移量，从 0 开始。",
            },
            count: {
                type: "number",
                description: "本次返回数量，建议 1~20。",
            },
            access_token: {
                type: "string",
                description: "可选。微信 access_token；不传则自动获取。",
            },
            app_id: {
                type: "string",
                description: "可选。微信 appid；未传时回退到环境变量 WECHAT_APP_ID。",
            },
            app_secret: {
                type: "string",
                description: "可选。微信 secret；未传时回退到环境变量 WECHAT_APP_SECRET。",
            },
        },
    },
};
/**
 * MCP 工具：删除永久素材。
 */
export const WECHAT_DELETE_MATERIAL_SCHEMA = {
    name: "wechat_delete_material",
    description: "素材管理：按 media_id 删除公众号永久素材。",
    inputSchema: {
        type: "object",
        properties: {
            media_id: {
                type: "string",
                description: "要删除的永久素材 media_id。",
            },
            access_token: {
                type: "string",
                description: "可选。微信 access_token；不传则自动获取。",
            },
            app_id: {
                type: "string",
                description: "可选。微信 appid；未传时回退到环境变量 WECHAT_APP_ID。",
            },
            app_secret: {
                type: "string",
                description: "可选。微信 secret；未传时回退到环境变量 WECHAT_APP_SECRET。",
            },
        },
        required: ["media_id"],
    },
};
/**
 * MCP 工具：获取草稿列表。
 */
export const WECHAT_LIST_DRAFTS_SCHEMA = {
    name: "wechat_list_drafts",
    description: "草稿管理：分页获取公众号草稿列表。",
    inputSchema: {
        type: "object",
        properties: {
            offset: {
                type: "number",
                description: "分页偏移量，从 0 开始。",
            },
            count: {
                type: "number",
                description: "本次返回数量，建议 1~20。",
            },
            no_content: {
                type: "number",
                description: "是否不返回具体文章内容，0=返回，1=不返回。",
            },
            access_token: {
                type: "string",
                description: "可选。微信 access_token；不传则自动获取。",
            },
            app_id: {
                type: "string",
                description: "可选。微信 appid；未传时回退到环境变量 WECHAT_APP_ID。",
            },
            app_secret: {
                type: "string",
                description: "可选。微信 secret；未传时回退到环境变量 WECHAT_APP_SECRET。",
            },
        },
    },
};
/**
 * MCP 工具：获取草稿详情。
 */
export const WECHAT_GET_DRAFT_SCHEMA = {
    name: "wechat_get_draft",
    description: "草稿管理：根据 media_id 获取草稿详情。",
    inputSchema: {
        type: "object",
        properties: {
            media_id: {
                type: "string",
                description: "草稿 media_id。",
            },
            access_token: {
                type: "string",
                description: "可选。微信 access_token；不传则自动获取。",
            },
            app_id: {
                type: "string",
                description: "可选。微信 appid；未传时回退到环境变量 WECHAT_APP_ID。",
            },
            app_secret: {
                type: "string",
                description: "可选。微信 secret；未传时回退到环境变量 WECHAT_APP_SECRET。",
            },
        },
        required: ["media_id"],
    },
};
/**
 * MCP 工具：删除草稿。
 */
export const WECHAT_DELETE_DRAFT_SCHEMA = {
    name: "wechat_delete_draft",
    description: "草稿管理：根据 media_id 删除草稿。",
    inputSchema: {
        type: "object",
        properties: {
            media_id: {
                type: "string",
                description: "草稿 media_id。",
            },
            access_token: {
                type: "string",
                description: "可选。微信 access_token；不传则自动获取。",
            },
            app_id: {
                type: "string",
                description: "可选。微信 appid；未传时回退到环境变量 WECHAT_APP_ID。",
            },
            app_secret: {
                type: "string",
                description: "可选。微信 secret；未传时回退到环境变量 WECHAT_APP_SECRET。",
            },
        },
        required: ["media_id"],
    },
};
/**
 * MCP 工具：发布草稿。
 */
export const WECHAT_PUBLISH_DRAFT_SCHEMA = {
    name: "wechat_publish_draft",
    description: "发布能力：将草稿 media_id 提交发布，返回 publish_id。",
    inputSchema: {
        type: "object",
        properties: {
            media_id: {
                type: "string",
                description: "待发布草稿的 media_id。",
            },
            access_token: {
                type: "string",
                description: "可选。微信 access_token；不传则自动获取。",
            },
            app_id: {
                type: "string",
                description: "可选。微信 appid；未传时回退到环境变量 WECHAT_APP_ID。",
            },
            app_secret: {
                type: "string",
                description: "可选。微信 secret；未传时回退到环境变量 WECHAT_APP_SECRET。",
            },
        },
        required: ["media_id"],
    },
};
/**
 * MCP 工具：查询发布状态。
 */
export const WECHAT_GET_PUBLISH_STATUS_SCHEMA = {
    name: "wechat_get_publish_status",
    description: "发布能力：根据 publish_id 查询发布进度与结果。",
    inputSchema: {
        type: "object",
        properties: {
            publish_id: {
                type: "string",
                description: "发布任务 ID（publish_id）。",
            },
            access_token: {
                type: "string",
                description: "可选。微信 access_token；不传则自动获取。",
            },
            app_id: {
                type: "string",
                description: "可选。微信 appid；未传时回退到环境变量 WECHAT_APP_ID。",
            },
            app_secret: {
                type: "string",
                description: "可选。微信 secret；未传时回退到环境变量 WECHAT_APP_SECRET。",
            },
        },
        required: ["publish_id"],
    },
};
/**
 * MCP 工具：获取已发布文章列表。
 */
export const WECHAT_LIST_PUBLISHED_SCHEMA = {
    name: "wechat_list_published",
    description: "发布能力：分页获取已发布文章列表。",
    inputSchema: {
        type: "object",
        properties: {
            offset: {
                type: "number",
                description: "分页偏移量，从 0 开始。",
            },
            count: {
                type: "number",
                description: "本次返回数量，建议 1~20。",
            },
            access_token: {
                type: "string",
                description: "可选。微信 access_token；不传则自动获取。",
            },
            app_id: {
                type: "string",
                description: "可选。微信 appid；未传时回退到环境变量 WECHAT_APP_ID。",
            },
            app_secret: {
                type: "string",
                description: "可选。微信 secret；未传时回退到环境变量 WECHAT_APP_SECRET。",
            },
        },
    },
};
/**
 * MCP 工具：删除已发布文章。
 */
export const WECHAT_DELETE_PUBLISHED_SCHEMA = {
    name: "wechat_delete_published",
    description: "发布能力：根据 article_id 删除已发布文章。",
    inputSchema: {
        type: "object",
        properties: {
            article_id: {
                type: "string",
                description: "已发布文章 ID（article_id）。",
            },
            access_token: {
                type: "string",
                description: "可选。微信 access_token；不传则自动获取。",
            },
            app_id: {
                type: "string",
                description: "可选。微信 appid；未传时回退到环境变量 WECHAT_APP_ID。",
            },
            app_secret: {
                type: "string",
                description: "可选。微信 secret；未传时回退到环境变量 WECHAT_APP_SECRET。",
            },
        },
        required: ["article_id"],
    },
};
async function resolveAccessToken(accessToken, appId, appSecret) {
    if (accessToken) {
        return accessToken;
    }
    const finalAppId = appId || process.env.WECHAT_APP_ID;
    const finalAppSecret = appSecret || process.env.WECHAT_APP_SECRET;
    if (!finalAppId || !finalAppSecret) {
        throw new Error("access_token not provided, and app_id/app_secret (or env WECHAT_APP_ID/WECHAT_APP_SECRET) not found.");
    }
    if (typeof typedWechatClient.fetchStableAccessToken === "function") {
        const tokenResponse = await typedWechatClient.fetchStableAccessToken(finalAppId, finalAppSecret);
        return tokenResponse.access_token;
    }
    const tokenResponse = await typedWechatClient.fetchAccessToken(finalAppId, finalAppSecret);
    return tokenResponse.access_token;
}
function assertNonEmpty(value, field) {
    if (!value || !value.trim()) {
        throw new Error(`missing required field: ${field}`);
    }
}
function requireClientMethod(name) {
    const method = typedWechatClient[name];
    if (typeof method !== "function") {
        throw new Error(`wenyan-core currently does not expose "${String(name)}". Please use the forked jussker/wenyan-core version (https://github.com/jussker/wenyan-core) that includes this API.`);
    }
    return method;
}
/**
 * 上传永久素材并返回结构化结果文本。
 */
export async function uploadMaterial(type, filePath, filename, accessToken, appId, appSecret) {
    assertNonEmpty(type, "type");
    assertNonEmpty(filePath, "file_path");
    const normalizedPath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
    const buffer = await fs.readFile(normalizedPath);
    const fileBlob = new Blob([buffer]);
    const finalFilename = filename || path.basename(normalizedPath);
    const finalAccessToken = await resolveAccessToken(accessToken, appId, appSecret);
    const uploadMaterialFn = requireClientMethod("uploadMaterial");
    const data = await uploadMaterialFn(type, fileBlob, finalFilename, finalAccessToken);
    return buildMcpResponse(JSON.stringify(data, null, 2));
}
/**
 * 分页获取永久素材列表并返回结构化结果文本。
 */
export async function listMaterials(type = "news", offset = 0, count = 20, accessToken, appId, appSecret) {
    const finalAccessToken = await resolveAccessToken(accessToken, appId, appSecret);
    const listMaterialsFn = requireClientMethod("batchGetMaterial");
    const data = await listMaterialsFn(finalAccessToken, type, offset, count);
    return buildMcpResponse(JSON.stringify(data, null, 2));
}
/**
 * 删除永久素材并返回结构化结果文本。
 */
export async function deleteMaterial(mediaId, accessToken, appId, appSecret) {
    assertNonEmpty(mediaId, "media_id");
    const finalAccessToken = await resolveAccessToken(accessToken, appId, appSecret);
    const deleteMaterialFn = requireClientMethod("deleteMaterial");
    const data = await deleteMaterialFn(finalAccessToken, mediaId);
    return buildMcpResponse(JSON.stringify(data, null, 2));
}
/**
 * 分页获取草稿列表并返回结构化结果文本。
 */
export async function listDrafts(offset = 0, count = 20, noContent = 0, accessToken, appId, appSecret) {
    const finalAccessToken = await resolveAccessToken(accessToken, appId, appSecret);
    const listDraftsFn = requireClientMethod("draftBatchGet");
    const data = await listDraftsFn(finalAccessToken, offset, count, noContent);
    return buildMcpResponse(JSON.stringify(data, null, 2));
}
/**
 * 获取草稿详情并返回结构化结果文本。
 */
export async function getDraft(mediaId, accessToken, appId, appSecret) {
    assertNonEmpty(mediaId, "media_id");
    const finalAccessToken = await resolveAccessToken(accessToken, appId, appSecret);
    const getDraftFn = requireClientMethod("getDraft");
    const data = await getDraftFn(finalAccessToken, mediaId);
    return buildMcpResponse(JSON.stringify(data, null, 2));
}
/**
 * 删除草稿并返回结构化结果文本。
 */
export async function deleteDraft(mediaId, accessToken, appId, appSecret) {
    assertNonEmpty(mediaId, "media_id");
    const finalAccessToken = await resolveAccessToken(accessToken, appId, appSecret);
    const deleteDraftFn = requireClientMethod("draftDelete");
    const data = await deleteDraftFn(finalAccessToken, mediaId);
    return buildMcpResponse(JSON.stringify(data, null, 2));
}
/**
 * 提交草稿发布并返回结构化结果文本。
 */
export async function publishDraft(mediaId, accessToken, appId, appSecret) {
    assertNonEmpty(mediaId, "media_id");
    const finalAccessToken = await resolveAccessToken(accessToken, appId, appSecret);
    const publishDraftFn = requireClientMethod("freepublishSubmit");
    const data = await publishDraftFn(finalAccessToken, mediaId);
    return buildMcpResponse(JSON.stringify(data, null, 2));
}
/**
 * 查询发布状态并返回结构化结果文本。
 */
export async function getPublishStatus(publishId, accessToken, appId, appSecret) {
    assertNonEmpty(publishId, "publish_id");
    const finalAccessToken = await resolveAccessToken(accessToken, appId, appSecret);
    const getPublishStatusFn = requireClientMethod("freepublishGet");
    const data = await getPublishStatusFn(finalAccessToken, publishId);
    return buildMcpResponse(JSON.stringify(data, null, 2));
}
/**
 * 分页获取已发布文章列表并返回结构化结果文本。
 */
export async function listPublished(offset = 0, count = 20, accessToken, appId, appSecret) {
    const finalAccessToken = await resolveAccessToken(accessToken, appId, appSecret);
    const listPublishedFn = requireClientMethod("freepublishBatchGet");
    const data = await listPublishedFn(finalAccessToken, offset, count);
    return buildMcpResponse(JSON.stringify(data, null, 2));
}
/**
 * 删除已发布文章并返回结构化结果文本。
 */
export async function deletePublished(articleId, accessToken, appId, appSecret) {
    assertNonEmpty(articleId, "article_id");
    const finalAccessToken = await resolveAccessToken(accessToken, appId, appSecret);
    const deletePublishedFn = requireClientMethod("freepublishDelete");
    const data = await deletePublishedFn(finalAccessToken, articleId);
    return buildMcpResponse(JSON.stringify(data, null, 2));
}
