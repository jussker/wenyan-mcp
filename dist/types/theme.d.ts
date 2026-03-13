/**
 * MCP 工具：列出主题。
 */
export declare const LIST_THEMES_SCHEMA: {
    readonly name: "list_themes";
    readonly description: "List the themes compatible with the 'create_draft' tool to save a draft to '微信公众号草稿箱'.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {};
    };
};
/**
 * MCP 工具：注册自定义主题。
 *
 * @remarks
 * `path` 格式 SPEC：
 * - 支持本地路径（绝对或相对 `process.cwd()`）
 * - 支持 HTTP/HTTPS URL
 * - 内容必须是合法 CSS 文本
 */
export declare const REGISTER_THEME_SCHEMA: {
    readonly name: "register_theme";
    readonly description: "Register a custom theme compatible with the 'create_draft' tool to save a draft to '微信公众号草稿箱'.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly name: {
                readonly type: "string";
                readonly description: "Name of the new custom theme.";
            };
            readonly path: {
                readonly type: "string";
                readonly description: "Path to the new custom theme CSS file. It could be a path to a local file or a URL.";
            };
        };
    };
};
/**
 * MCP 工具：删除自定义主题。
 */
export declare const REMOVE_THEME_SCHEMA: {
    readonly name: "remove_theme";
    readonly description: "Remove a custom theme compatible with the 'create_draft' tool to save a draft to '微信公众号草稿箱'.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly name: {
                readonly type: "string";
                readonly description: "Name of the custom theme to remove.";
            };
        };
    };
};
