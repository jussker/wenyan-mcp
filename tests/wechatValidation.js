import assert from "node:assert/strict";
import { deleteMaterial, getPublishStatus, uploadMaterial } from "../dist/wechat.js";

async function assertRejectsWithField(promiseFactory, field) {
    await assert.rejects(
        promiseFactory,
        (error) => error instanceof Error && error.message.includes(`missing required field: ${field}`),
        `expected missing required field error for ${field}`,
    );
}

async function run() {
    await assertRejectsWithField(() => uploadMaterial("", "/tmp/a.jpg"), "type");
    await assertRejectsWithField(() => uploadMaterial("image", "   "), "file_path");
    await assertRejectsWithField(() => deleteMaterial(""), "media_id");
    await assertRejectsWithField(() => getPublishStatus(" "), "publish_id");
    console.log("WeChat validation test passed.");
}

run().catch((error) => {
    console.error("WeChat validation test failed:", error);
    process.exit(1);
});
