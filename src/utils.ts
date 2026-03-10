import path from "node:path";
import fs from "node:fs/promises";
import { getNormalizeFilePath } from "@wenyan-md/core/wrapper";

/**
 * 创建 MCP 标准文本响应体。
 *
 * @param content - 要返回给 MCP 客户端的文本内容。
 * @returns MCP 响应对象。
 */
export function buildMcpResponse(content: string) {
    return {
        content: [
            {
                type: "text",
                text: content,
            },
        ],
    };
}

class GlobalStates {
    private _isClientMode = false;
    private _serverUrl?: string;
    private _apiKey?: string;

    get isClientMode() {
        return this._isClientMode;
    }

    set isClientMode(value: boolean) {
        this._isClientMode = value;
    }

    get serverUrl() {
        return this._serverUrl;
    }

    set serverUrl(value: string | undefined) {
        this._serverUrl = value;
    }

    get apiKey() {
        return this._apiKey;
    }

    set apiKey(value: string | undefined) {
        this._apiKey = value;
    }
}

export const globalStates = new GlobalStates();

/**
 * 读取输入 Markdown 内容。
 *
 * @remarks
 * `file` 路径格式 SPEC：
 * - 支持绝对路径
 * - 支持相对路径（相对 `process.cwd()`）
 * - 文件内容按 UTF-8 解码
 *
 * @param inputContent - 直接传入的 Markdown 内容。
 * @param file - Markdown 文件路径。
 * @returns 内容及文件所在绝对目录。
 */
export async function getInputContent(
    inputContent?: string,
    file?: string,
): Promise<{ content: string; absoluteDirPath: string | undefined }> {
    let absoluteDirPath: string | undefined = undefined;

    // 2. 尝试从文件读取
    if (!inputContent && file) {
        const normalizePath = getNormalizeFilePath(file);
        inputContent = await fs.readFile(normalizePath, "utf-8");
        absoluteDirPath = path.dirname(normalizePath);
    }

    // 3. 校验输入
    if (!inputContent) {
        throw new Error("missing input-content (no argument, no stdin, and no file).");
    }

    return { content: inputContent, absoluteDirPath };
}
