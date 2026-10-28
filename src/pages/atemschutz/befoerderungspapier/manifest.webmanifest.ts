import type { APIRoute } from "astro";
import { buildManifest, manifestResponse, transportDocumentText } from "@/pwa/apps";

export const prerender = true;

export const GET: APIRoute = () => manifestResponse(buildManifest("transportDocument", transportDocumentText));
