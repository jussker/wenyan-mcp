/**
 * MCP 工具：列出主题。
 */
export const LIST_THEMES_SCHEMA = {
    name: "list_themes",
    description: "List the themes compatible with the 'create_draft' tool to save a draft to '微信公众号草稿箱'.",
    inputSchema: {
        type: "object",
        properties: {},
    },
} as const;

/**
 * MCP 工具：注册自定义主题。
 *
 * @remarks
 * `path` 格式 SPEC：
 * - 支持本地路径（绝对或相对 `process.cwd()`）
 * - 支持 HTTP/HTTPS URL
 * - 内容必须是合法 CSS 文本
 */
export const REGISTER_THEME_SCHEMA = {
    name: "register_theme",
    description:
        "Register a custom theme compatible with the 'create_draft' tool to save a draft to '微信公众号草稿箱'.",
    inputSchema: {
        type: "object",
        properties: {
            name: {
                type: "string",
                description: "Name of the new custom theme.",
            },
            path: {
                type: "string",
                description: "Path to the new custom theme CSS file. It could be a path to a local file or a URL.",
            },
        },
    },
} as const;

/**
 * MCP 工具：删除自定义主题。
 */
export const REMOVE_THEME_SCHEMA = {
    name: "remove_theme",
    description:
        "Remove a custom theme compatible with the 'create_draft' tool to save a draft to '微信公众号草稿箱'.",
    inputSchema: {
        type: "object",
        properties: {
            name: {
                type: "string",
                description: "Name of the custom theme to remove.",
            },
        },
    },
} as const;
