import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
    CREATE_DRAFT_SCHEMA,
    buildCreateDraftPublishOptions,
    getCreateDraftBaseResolutionMessage,
    resolveCreateDraftAnchor,
} from "../dist/publish.js";
import { getInputContent } from "../dist/utils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
    const properties = CREATE_DRAFT_SCHEMA.inputSchema.properties;
    assert.ok(properties.content_base_dir, "create_draft schema should expose content_base_dir");
    assert.ok(properties.mermaid, "create_draft schema should expose mermaid");
    assert.ok(properties.mermaid_ppi, "create_draft schema should expose mermaid_ppi");
    assert.ok(properties.mermaid_render_scale, "create_draft schema should expose mermaid_render_scale");

    const optionsFromBaseDir = buildCreateDraftPublishOptions(
        "# test",
        "",
        "",
        "phycat",
        "test-version",
        {
            contentBaseDir: "/tmp/docs",
            mermaid: true,
            mermaidPpi: 192,
            mermaidRenderScale: 2,
        },
    );

    assert.equal(optionsFromBaseDir.file, "/tmp/docs/__virtual__.md");
    assert.equal(optionsFromBaseDir.mermaid, true);
    assert.equal(optionsFromBaseDir.mermaidPpi, 192);
    assert.equal(optionsFromBaseDir.mermaidRenderScale, 2);

    const optionsFromFile = buildCreateDraftPublishOptions(
        "# test",
        "https://example.com/article.md",
        "./tests/publish.md",
        "phycat",
        "test-version",
        {
            contentBaseDir: "/tmp/docs",
        },
    );
    assert.equal(optionsFromFile.file, "./tests/publish.md");

    const optionsFromCwdFallback = buildCreateDraftPublishOptions(
        "![[relative-image.jpg]]",
        "",
        "",
        "phycat",
        "test-version",
        {},
    );
    assert.equal(optionsFromCwdFallback.file, path.join(process.cwd(), "__content__.md"));

    const cwdAnchor = resolveCreateDraftAnchor("![[relative-image.jpg]]", "", "", "");
    assert.equal(cwdAnchor.source, "cwd");
    const baseMessage = getCreateDraftBaseResolutionMessage("![[relative-image.jpg]]", cwdAnchor);
    assert.ok(baseMessage?.includes("Using process.cwd() as baseDir"));

    const noneAnchor = resolveCreateDraftAnchor("", "", "", "");
    assert.equal(noneAnchor.source, "none");
    assert.equal(getCreateDraftBaseResolutionMessage("", noneAnchor), undefined);

    const virtualFile = path.resolve(__dirname, "../tmp/non-existent.md");
    const directContent = "# hello";
    const directResult = await getInputContent(directContent, virtualFile);

    assert.equal(directResult.content, directContent);
    assert.equal(directResult.absoluteDirPath, path.dirname(virtualFile));

    console.log("create_draft bridge test passed");
}

run().catch((error) => {
    console.error("create_draft bridge test failed:", error);
    process.exit(1);
});
