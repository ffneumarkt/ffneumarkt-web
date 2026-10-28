import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { collectPrecache, precacheVersion, toRequestPath } from "./precache";

let outDir: string;

const write = (path: string, content = "") => {
    const file = join(outDir, path);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, content);
};

beforeEach(() => {
    outDir = mkdtempSync(join(tmpdir(), "precache-"));
    write(
        "tool/index.html",
        `<link rel="stylesheet" href="/_astro/page.css"><link rel="manifest" href="/tool/manifest.webmanifest">
         <link rel="sitemap" href="/sitemap-index.xml"><img src="/logo.png"><a href="/kontakt">Kontakt</a><a href="https://example.com/form.pdf">LFV</a>
         <script type="module" src="/_astro/page.js"></script>`,
    );
    write("tool/manifest.webmanifest", `{"icons":[{"src":"/icons/tool-192.png"}]}`);
    write("_astro/page.css", `@font-face{src:url(/_astro/roboto.woff2) format("woff2")}`);
    write(
        "_astro/page.js",
        `import{a}from"./shared.js";const m=["_astro/fillForm.js","_astro/pdf-lib.js"];fetch("/forms/form.pdf")`,
    );
    write("_astro/shared.js", `export const a=1;`);
    write("_astro/fillForm.js", `import"./pdf-lib.js";import"../_worker.js/index.js"`);
    write("_astro/pdf-lib.js");
    write("_astro/roboto.woff2");
    write("_astro/unused.js");
    write("_worker.js/index.js");
    write("forms/form.pdf");
    write("icons/tool-192.png");
    write("logo.png");
    write("sitemap-index.xml");
    write("kontakt/index.html");
});

afterEach(() => rmSync(outDir, { recursive: true, force: true }));

describe("collectPrecache", () => {
    it("follows references from HTML, CSS, JS and the manifest transitively", () => {
        expect(collectPrecache(outDir, ["tool/index.html"])).toEqual([
            "/_astro/fillForm.js",
            "/_astro/page.css",
            "/_astro/page.js",
            "/_astro/pdf-lib.js",
            "/_astro/roboto.woff2",
            "/_astro/shared.js",
            "/forms/form.pdf",
            "/icons/tool-192.png",
            "/logo.png",
            "/tool/index.html",
            "/tool/manifest.webmanifest",
        ]);
    });

    it("fails when an entry is missing", () => {
        expect(() => collectPrecache(outDir, ["offline/index.html"])).toThrow("/offline/index.html");
    });
});

describe("precacheVersion", () => {
    it("changes when a precached file changes", () => {
        const files = collectPrecache(outDir, ["tool/index.html"]);
        const before = precacheVersion(outDir, files);
        write("_astro/pdf-lib.js", "changed");
        expect(precacheVersion(outDir, files)).not.toBe(before);
    });
});

describe("toRequestPath", () => {
    it("drops index.html like the server does", () => {
        expect(toRequestPath("/tool/index.html")).toBe("/tool/");
        expect(toRequestPath("/_astro/page.js")).toBe("/_astro/page.js");
    });
});
