import { renderAndPublish, renderAndPublishToServer } from "@wenyan-md/core/wrapper";
import { buildMcpResponse, getInputContent, globalStates } from "./utils.js";

/**
 * MCP 工具：渲染 Markdown 并存入公众号草稿箱。
 *
 * @remarks
 * 输入优先级：`file` / `content_url` > `content`。
 * `file` 路径格式 SPEC：
 * - 允许绝对路径或相对路径（相对 `process.cwd()`）
 * - 必须是 UTF-8 Markdown 文件（建议 `.md`）
 */
export const CREATE_DRAFT_SCHEMA = {
    name: "create_draft",
    description: `Render a Markdown article with a selected theme and save it as a draft to '微信公众号草稿箱'. Use 'wechat_publish_draft' to publish a draft to the public.

The Markdown content MUST begin with a YAML frontmatter block. Required and optional fields:

\`\`\`
---
title: <string>        # REQUIRED — article title
cover: <path|url>      # OPTIONAL — local file path or https URL for the cover image; omit if the body already contains at least one image
author: <string>       # OPTIONAL — author name displayed in the article
source_url: <url>      # OPTIONAL — original article URL
---
\`\`\`

Constraints:
- 'title' is mandatory; the request will fail without it.
- Either 'cover' OR at least one inline image in the body is required; the request will fail if neither is present.
- 'cover' accepts: absolute local path (e.g. /Users/xxx/cover.jpg), relative path, or https image URL.

Inline images in the article body are also supported and will be auto-uploaded to the WeChat material library before the draft is saved. Supported image formats:
- Absolute local path (e.g. /Users/xxx/image.jpg)
- Relative path from the article file location (e.g. ./assets/image.png)
- Network URL (https://example.com/image.jpg)`,
    inputSchema: {
        type: "object",
        properties: {
            content: {
                type: "string",
                description:
                    "The Markdown text to save as draft. REQUIRED if 'file' or 'content_url' is not provided. MUST include the frontmatter block (title is required; cover or an inline image is required).",
            },
            content_url: {
                type: "string",
                description:
                    "A URL (e.g. GitHub raw link) to a Markdown file. Preferred over 'content' for large files to save tokens.",
            },
            file: {
                type: "string",
                description:
                    "The local path (absolute or relative) to a Markdown file. Preferred over 'content' for large files to save tokens.",
            },
            theme_id: {
                type: "string",
                description:
                    "ID of the theme to use (e.g., default, orangeheart, rainbow, lapis, pie, maize, purple, phycat, meridian, meridian_night).",
            },
        },
    },
} as const;

/**
 * 渲染 Markdown 并存入公众号草稿箱。
 *
 * @param contentUrl - 远程 Markdown URL。
 * @param file - 本地 Markdown 文件路径。
 * @param content - Markdown 文本内容。
 * @param themeId - 主题 ID。
 * @param clientVersion - 可选客户端版本。
 * @returns MCP 文本响应对象。
 */
export async function createDraft(contentUrl: string, file: string, content: string, themeId: string, clientVersion?: string) {
    let mediaId = "";
    const publishOptions = {
        file: file ? file : contentUrl,
        theme: themeId,
        highlight: "solarized-light",
        macStyle: true,
        footnote: true,
        server: globalStates.serverUrl,
        apiKey: globalStates.apiKey,
        clientVersion,
        disableStdin: true,
    };
    if(globalStates.isClientMode) {
        mediaId = await renderAndPublishToServer(content, publishOptions, getInputContent);
    } else {
        mediaId = await renderAndPublish(content, publishOptions, getInputContent);
    }

    return buildMcpResponse(
        `Your article was successfully saved to '公众号草稿箱' as a draft. The media ID is ${mediaId}. Use 'wechat_publish_draft' to publish it.`,
    );
}
