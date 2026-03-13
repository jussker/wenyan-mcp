/**
 * MCP 工具：上传永久素材。
 *
 * @remarks
 * `file_path` 格式 SPEC：
 * - 可以是绝对路径（如 `/home/runner/work/wenyan-mcp/wenyan-mcp/tests/wenyan.jpg`）
 * - 也可以是相对路径（相对 `process.cwd()`）
 * - 指向已存在文件；文件名将默认使用路径 basename（可被 `filename` 覆盖）
 */
export declare const WECHAT_UPLOAD_MATERIAL_SCHEMA: {
    readonly name: "wechat_upload_material";
    readonly description: "素材管理：上传公众号永久素材并返回 media_id。";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly type: {
                readonly type: "string";
                readonly description: "素材类型，常见值：image、voice、video、thumb。";
            };
            readonly file_path: {
                readonly type: "string";
                readonly description: "本地素材文件路径。SPEC: 允许绝对路径或相对路径（相对 process.cwd()），且必须是可读取的已有文件。";
            };
            readonly filename: {
                readonly type: "string";
                readonly description: "上传到微信端使用的文件名；不传时默认取 file_path 的 basename。";
            };
            readonly access_token: {
                readonly type: "string";
                readonly description: "可选。微信 access_token；不传则自动通过 app_id/app_secret 或环境变量获取。";
            };
            readonly app_id: {
                readonly type: "string";
                readonly description: "可选。微信 appid；未传时回退到环境变量 WECHAT_APP_ID。";
            };
            readonly app_secret: {
                readonly type: "string";
                readonly description: "可选。微信 secret；未传时回退到环境变量 WECHAT_APP_SECRET。";
            };
        };
        readonly required: readonly ["type", "file_path"];
    };
};
/**
 * MCP 工具：获取永久素材列表。
 */
export declare const WECHAT_LIST_MATERIALS_SCHEMA: {
    readonly name: "wechat_list_materials";
    readonly description: "素材管理：分页获取公众号永久素材列表。";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly type: {
                readonly type: "string";
                readonly description: "素材类型，常见值：news、image、voice、video。";
            };
            readonly offset: {
                readonly type: "number";
                readonly description: "分页偏移量，从 0 开始。";
            };
            readonly count: {
                readonly type: "number";
                readonly description: "本次返回数量，建议 1~20。";
            };
            readonly access_token: {
                readonly type: "string";
                readonly description: "可选。微信 access_token；不传则自动获取。";
            };
            readonly app_id: {
                readonly type: "string";
                readonly description: "可选。微信 appid；未传时回退到环境变量 WECHAT_APP_ID。";
            };
            readonly app_secret: {
                readonly type: "string";
                readonly description: "可选。微信 secret；未传时回退到环境变量 WECHAT_APP_SECRET。";
            };
        };
    };
};
/**
 * MCP 工具：删除永久素材。
 */
export declare const WECHAT_DELETE_MATERIAL_SCHEMA: {
    readonly name: "wechat_delete_material";
    readonly description: "素材管理：按 media_id 删除公众号永久素材。";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly media_id: {
                readonly type: "string";
                readonly description: "要删除的永久素材 media_id。";
            };
            readonly access_token: {
                readonly type: "string";
                readonly description: "可选。微信 access_token；不传则自动获取。";
            };
            readonly app_id: {
                readonly type: "string";
                readonly description: "可选。微信 appid；未传时回退到环境变量 WECHAT_APP_ID。";
            };
            readonly app_secret: {
                readonly type: "string";
                readonly description: "可选。微信 secret；未传时回退到环境变量 WECHAT_APP_SECRET。";
            };
        };
        readonly required: readonly ["media_id"];
    };
};
/**
 * MCP 工具：获取草稿列表。
 */
export declare const WECHAT_LIST_DRAFTS_SCHEMA: {
    readonly name: "wechat_list_drafts";
    readonly description: "草稿管理：分页获取公众号草稿列表。";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly offset: {
                readonly type: "number";
                readonly description: "分页偏移量，从 0 开始。";
            };
            readonly count: {
                readonly type: "number";
                readonly description: "本次返回数量，建议 1~20。";
            };
            readonly no_content: {
                readonly type: "number";
                readonly description: "是否不返回具体文章内容，0=返回，1=不返回。";
            };
            readonly access_token: {
                readonly type: "string";
                readonly description: "可选。微信 access_token；不传则自动获取。";
            };
            readonly app_id: {
                readonly type: "string";
                readonly description: "可选。微信 appid；未传时回退到环境变量 WECHAT_APP_ID。";
            };
            readonly app_secret: {
                readonly type: "string";
                readonly description: "可选。微信 secret；未传时回退到环境变量 WECHAT_APP_SECRET。";
            };
        };
    };
};
/**
 * MCP 工具：获取草稿详情。
 */
export declare const WECHAT_GET_DRAFT_SCHEMA: {
    readonly name: "wechat_get_draft";
    readonly description: "草稿管理：根据 media_id 获取草稿详情。";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly media_id: {
                readonly type: "string";
                readonly description: "草稿 media_id。";
            };
            readonly access_token: {
                readonly type: "string";
                readonly description: "可选。微信 access_token；不传则自动获取。";
            };
            readonly app_id: {
                readonly type: "string";
                readonly description: "可选。微信 appid；未传时回退到环境变量 WECHAT_APP_ID。";
            };
            readonly app_secret: {
                readonly type: "string";
                readonly description: "可选。微信 secret；未传时回退到环境变量 WECHAT_APP_SECRET。";
            };
        };
        readonly required: readonly ["media_id"];
    };
};
/**
 * MCP 工具：删除草稿。
 */
export declare const WECHAT_DELETE_DRAFT_SCHEMA: {
    readonly name: "wechat_delete_draft";
    readonly description: "草稿管理：根据 media_id 删除草稿。";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly media_id: {
                readonly type: "string";
                readonly description: "草稿 media_id。";
            };
            readonly access_token: {
                readonly type: "string";
                readonly description: "可选。微信 access_token；不传则自动获取。";
            };
            readonly app_id: {
                readonly type: "string";
                readonly description: "可选。微信 appid；未传时回退到环境变量 WECHAT_APP_ID。";
            };
            readonly app_secret: {
                readonly type: "string";
                readonly description: "可选。微信 secret；未传时回退到环境变量 WECHAT_APP_SECRET。";
            };
        };
        readonly required: readonly ["media_id"];
    };
};
/**
 * MCP 工具：发布草稿。
 */
export declare const WECHAT_PUBLISH_DRAFT_SCHEMA: {
    readonly name: "wechat_publish_draft";
    readonly description: "发布能力：将草稿 media_id 提交发布，返回 publish_id。";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly media_id: {
                readonly type: "string";
                readonly description: "待发布草稿的 media_id。";
            };
            readonly access_token: {
                readonly type: "string";
                readonly description: "可选。微信 access_token；不传则自动获取。";
            };
            readonly app_id: {
                readonly type: "string";
                readonly description: "可选。微信 appid；未传时回退到环境变量 WECHAT_APP_ID。";
            };
            readonly app_secret: {
                readonly type: "string";
                readonly description: "可选。微信 secret；未传时回退到环境变量 WECHAT_APP_SECRET。";
            };
        };
        readonly required: readonly ["media_id"];
    };
};
/**
 * MCP 工具：查询发布状态。
 */
export declare const WECHAT_GET_PUBLISH_STATUS_SCHEMA: {
    readonly name: "wechat_get_publish_status";
    readonly description: "发布能力：根据 publish_id 查询发布进度与结果。";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly publish_id: {
                readonly type: "string";
                readonly description: "发布任务 ID（publish_id）。";
            };
            readonly access_token: {
                readonly type: "string";
                readonly description: "可选。微信 access_token；不传则自动获取。";
            };
            readonly app_id: {
                readonly type: "string";
                readonly description: "可选。微信 appid；未传时回退到环境变量 WECHAT_APP_ID。";
            };
            readonly app_secret: {
                readonly type: "string";
                readonly description: "可选。微信 secret；未传时回退到环境变量 WECHAT_APP_SECRET。";
            };
        };
        readonly required: readonly ["publish_id"];
    };
};
/**
 * MCP 工具：获取已发布文章列表。
 */
export declare const WECHAT_LIST_PUBLISHED_SCHEMA: {
    readonly name: "wechat_list_published";
    readonly description: "发布能力：分页获取已发布文章列表。";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly offset: {
                readonly type: "number";
                readonly description: "分页偏移量，从 0 开始。";
            };
            readonly count: {
                readonly type: "number";
                readonly description: "本次返回数量，建议 1~20。";
            };
            readonly access_token: {
                readonly type: "string";
                readonly description: "可选。微信 access_token；不传则自动获取。";
            };
            readonly app_id: {
                readonly type: "string";
                readonly description: "可选。微信 appid；未传时回退到环境变量 WECHAT_APP_ID。";
            };
            readonly app_secret: {
                readonly type: "string";
                readonly description: "可选。微信 secret；未传时回退到环境变量 WECHAT_APP_SECRET。";
            };
        };
    };
};
/**
 * MCP 工具：删除已发布文章。
 */
export declare const WECHAT_DELETE_PUBLISHED_SCHEMA: {
    readonly name: "wechat_delete_published";
    readonly description: "发布能力：根据 article_id 删除已发布文章。";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly article_id: {
                readonly type: "string";
                readonly description: "已发布文章 ID（article_id）。";
            };
            readonly access_token: {
                readonly type: "string";
                readonly description: "可选。微信 access_token；不传则自动获取。";
            };
            readonly app_id: {
                readonly type: "string";
                readonly description: "可选。微信 appid；未传时回退到环境变量 WECHAT_APP_ID。";
            };
            readonly app_secret: {
                readonly type: "string";
                readonly description: "可选。微信 secret；未传时回退到环境变量 WECHAT_APP_SECRET。";
            };
        };
        readonly required: readonly ["article_id"];
    };
};
/**
 * 上传永久素材并返回结构化结果文本。
 */
export declare function uploadMaterial(type: string, filePath: string, filename?: string, accessToken?: string, appId?: string, appSecret?: string): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
/**
 * 分页获取永久素材列表并返回结构化结果文本。
 */
export declare function listMaterials(type?: string, offset?: number, count?: number, accessToken?: string, appId?: string, appSecret?: string): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
/**
 * 删除永久素材并返回结构化结果文本。
 */
export declare function deleteMaterial(mediaId: string, accessToken?: string, appId?: string, appSecret?: string): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
/**
 * 分页获取草稿列表并返回结构化结果文本。
 */
export declare function listDrafts(offset?: number, count?: number, noContent?: number, accessToken?: string, appId?: string, appSecret?: string): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
/**
 * 获取草稿详情并返回结构化结果文本。
 */
export declare function getDraft(mediaId: string, accessToken?: string, appId?: string, appSecret?: string): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
/**
 * 删除草稿并返回结构化结果文本。
 */
export declare function deleteDraft(mediaId: string, accessToken?: string, appId?: string, appSecret?: string): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
/**
 * 提交草稿发布并返回结构化结果文本。
 */
export declare function publishDraft(mediaId: string, accessToken?: string, appId?: string, appSecret?: string): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
/**
 * 查询发布状态并返回结构化结果文本。
 */
export declare function getPublishStatus(publishId: string, accessToken?: string, appId?: string, appSecret?: string): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
/**
 * 分页获取已发布文章列表并返回结构化结果文本。
 */
export declare function listPublished(offset?: number, count?: number, accessToken?: string, appId?: string, appSecret?: string): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
/**
 * 删除已发布文章并返回结构化结果文本。
 */
export declare function deletePublished(articleId: string, accessToken?: string, appId?: string, appSecret?: string): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
