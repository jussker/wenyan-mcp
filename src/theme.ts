/**
 * MCP tool schema for listing available themes.
 *
 * @remarks
 * Response format (one JSON string per text block):
 * - `{ "id": string, "name": string, "description": string }`
 */
export const LIST_THEMES_SCHEMA = {
    name: "list_themes",
    description: "List the themes compatible with the 'publish_article' tool to publish an article to '微信公众号'.",
    inputSchema: {
        type: "object",
        properties: {},
    },
} as const;

/**
 * MCP tool schema for registering a custom CSS theme.
 *
 * @remarks
 * `path` SPEC:
 * - Local absolute path: `/home/user/theme.css`
 * - Local relative path: `./themes/custom.css`
 * - Remote URL: `https://example.com/theme.css`
 */
export const REGISTER_THEME_SCHEMA = {
    name: "register_theme",
    description:
        "Register a custom theme compatible with the 'publish_article' tool to publish an article to '微信公众号'.",
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
 * MCP tool schema for removing a previously registered custom theme.
 *
 * @remarks
 * `name` is case-sensitive and should match the registered theme id/name.
 */
export const REMOVE_THEME_SCHEMA = {
    name: "remove_theme",
    description:
        "Remove a custom theme compatible with the 'publish_article' tool to publish an article to '微信公众号'.",
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
