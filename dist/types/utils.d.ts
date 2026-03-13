/**
 * 创建 MCP 标准文本响应体。
 *
 * @param content - 要返回给 MCP 客户端的文本内容。
 * @returns MCP 响应对象。
 */
export declare function buildMcpResponse(content: string): {
    content: {
        type: string;
        text: string;
    }[];
};
declare class GlobalStates {
    private _isClientMode;
    private _serverUrl?;
    private _apiKey?;
    get isClientMode(): boolean;
    set isClientMode(value: boolean);
    get serverUrl(): string | undefined;
    set serverUrl(value: string | undefined);
    get apiKey(): string | undefined;
    set apiKey(value: string | undefined);
}
export declare const globalStates: GlobalStates;
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
export declare function getInputContent(inputContent?: string, file?: string): Promise<{
    content: string;
    absoluteDirPath: string | undefined;
}>;
export {};
