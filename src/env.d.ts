/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

type Runtime = import("@astrojs/cloudflare").Runtime;

declare namespace App {
    interface Locals extends Runtime { }
}

declare module '*?raw' {
    const content: string;
    export default content;
}

declare module '@fontsource/roboto';
