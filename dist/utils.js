import path from "node:path";
import fs from "node:fs/promises";
import { getNormalizeFilePath } from "@wenyan-md/core/wrapper";
/**
 * 创建 MCP 标准文本响应体。
 *
 * @param content - 要返回给 MCP 客户端的文本内容。
 * @returns MCP 响应对象。
 */
export function buildMcpResponse(content) {
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
    _isClientMode = false;
    _serverUrl;
    _apiKey;
    get isClientMode() {
        return this._isClientMode;
    }
    set isClientMode(value) {
        this._isClientMode = value;
    }
    get serverUrl() {
        return this._serverUrl;
    }
    set serverUrl(value) {
        this._serverUrl = value;
    }
    get apiKey() {
        return this._apiKey;
    }
    set apiKey(value) {
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
export async function getInputContent(inputContent, file) {
    let absoluteDirPath = undefined;
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
