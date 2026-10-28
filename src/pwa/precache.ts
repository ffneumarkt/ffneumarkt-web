import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join, posix, relative, sep } from "node:path";

// File types that can reference further files and are therefore scanned.
const SCANNED = /\.(?:html|js|mjs|css|webmanifest)$/;
// Candidate references: quoted or url()-wrapped paths with a file extension.
const REFERENCE = /["'`(]((?:\.{0,2}\/)?[\w@./-]+\.\w{2,12})(?:[?#][^"'`)]*)?["'`)]/g;
// Server code must never end up in the browser cache, sitemaps are of no use offline.
const EXCLUDED = /^\/_worker\.js\/|^\/sitemap[^/]*\.xml$/;

const toUrlPath = (outDir: string, file: string) => `/${relative(outDir, file).split(sep).join("/")}`;

// Resolves a reference like a browser would (relative to the referencing file) and like Vite's
// preload map does (relative to the site root); returns only files that exist in the build output.
function resolveReference(outDir: string, fromFile: string, reference: string): string[] {
    const fromUrl = toUrlPath(outDir, dirname(fromFile));
    const candidates = reference.startsWith("/")
        ? [reference]
        : [posix.join(fromUrl, reference), posix.join("/", reference)];

    return candidates
        .map((urlPath) => join(outDir, ...urlPath.split("/")))
        .filter((file) => file.startsWith(outDir) && existsSync(file) && statSync(file).isFile());
}

// Collects the entry files and everything they reference, transitively, as URL paths.
export function collectPrecache(outDir: string, entries: string[]): string[] {
    const found = new Set<string>();
    const queue = entries.map((entry) => join(outDir, ...entry.split("/")));

    while (queue.length > 0) {
        const file = queue.shift()!;
        const urlPath = toUrlPath(outDir, file);
        if (found.has(urlPath) || EXCLUDED.test(urlPath)) {
            continue;
        }
        if (!existsSync(file)) {
            throw new Error(`Precache entry is missing in the build output: ${urlPath}`);
        }
        found.add(urlPath);
        if (!SCANNED.test(file)) {
            continue;
        }
        for (const match of readFileSync(file, "utf8").matchAll(REFERENCE)) {
            queue.push(...resolveReference(outDir, file, match[1]));
        }
    }

    return [...found].sort();
}

// Changes whenever a precached file changes, so browsers install the new service worker.
export function precacheVersion(outDir: string, urlPaths: string[]): string {
    const hash = createHash("sha256");
    for (const urlPath of urlPaths) {
        hash.update(urlPath);
        hash.update(readFileSync(join(outDir, ...urlPath.split("/"))));
    }
    return hash.digest("hex").slice(0, 16);
}

// The service worker caches pages under their URL without index.html, like Cloudflare serves them.
export const toRequestPath = (urlPath: string) => urlPath.replace(/\/index\.html$/, "/");
