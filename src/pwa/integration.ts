import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { AstroIntegration } from "astro";
import { OFFLINE_PATH, TRANSPORT_DOCUMENT_PATH } from "./apps";
import { collectPrecache, precacheVersion, toRequestPath } from "./precache";

const template = join(process.cwd(), "src/pwa/sw.js");

// Writes dist/sw.js with the transport document generator, the offline page and everything they load.
export function pwa(): AstroIntegration {
    return {
        name: "ffneumarkt-pwa",
        hooks: {
            "astro:build:done": ({ dir, logger }) => {
                const outDir = fileURLToPath(dir);
                const files = collectPrecache(outDir, [
                    `${TRANSPORT_DOCUMENT_PATH}/index.html`,
                    `${OFFLINE_PATH}/index.html`,
                ]);
                const version = precacheVersion(outDir, files);
                const precache = files.map(toRequestPath);

                const sw = readFileSync(template, "utf8")
                    .replace("__VERSION__", version)
                    .replace('["__PRECACHE__"]', JSON.stringify(precache))
                    .replace("__TRANSPORT_DOCUMENT_PATH__", TRANSPORT_DOCUMENT_PATH)
                    .replace("__OFFLINE_PATH__", OFFLINE_PATH);
                writeFileSync(new URL("sw.js", dir), sw);
                logger.info(`sw.js written, version ${version}, ${precache.length} precached files`);
            },
        },
    };
}
