/**
 * MCP 工具：渲染 Markdown 并存入公众号草稿箱。
 *
 * @remarks
 * 输入优先级：`file` / `content_url` > `content`。
 * `file` 路径格式 SPEC：
 * - 允许绝对路径或相对路径（相对 `process.cwd()`）
 * - 必须是 UTF-8 Markdown 文件（建议 `.md`）
 */
export declare const CREATE_DRAFT_SCHEMA: {
    readonly name: "create_draft";
    readonly description: "Render a Markdown article with a selected theme and save it as a draft to '微信公众号草稿箱'. Use 'wechat_publish_draft' to publish a draft to the public.\n\nThe Markdown content MUST begin with a YAML frontmatter block. Required and optional fields:\n\n```\n---\ntitle: <string>        # REQUIRED — article title\ncover: <path|url>      # OPTIONAL — local file path or https URL for the cover image; omit if the body already contains at least one image\nauthor: <string>       # OPTIONAL — author name displayed in the article\nsource_url: <url>      # OPTIONAL — original article URL\n---\n```\n\nConstraints:\n- 'title' is mandatory; the request will fail without it.\n- Either 'cover' OR at least one inline image in the body is required; the request will fail if neither is present.\n- 'cover' accepts: absolute local path (e.g. /Users/xxx/cover.jpg), relative path, or https image URL.\n\nInline images in the article body are also supported and will be auto-uploaded to the WeChat material library before the draft is saved. Supported image formats:\n- Absolute local path (e.g. /Users/xxx/image.jpg)\n- Relative path from the article file location (e.g. ./assets/image.png)\n- Network URL (https://example.com/image.jpg)";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly content: {
                readonly type: "string";
                readonly description: "The Markdown text to save as draft. REQUIRED if 'file' or 'content_url' is not provided. MUST include the frontmatter block (title is required; cover or an inline image is required).";
            };
            readonly content_url: {
                readonly type: "string";
                readonly description: "A URL (e.g. GitHub raw link) to a Markdown file. Preferred over 'content' for large files to save tokens.";
            };
            readonly file: {
                readonly type: "string";
                readonly description: "The local path (absolute or relative) to a Markdown file. Preferred over 'content' for large files to save tokens.";
            };
            readonly theme_id: {
                readonly type: "string";
                readonly description: "ID of the theme to use (e.g., default, orangeheart, rainbow, lapis, pie, maize, purple, phycat, meridian, meridian_night).";
            };
        };
    };
};
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
export declare function createDraft(contentUrl: string, file: string, content: string, themeId: string, clientVersion?: string): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
