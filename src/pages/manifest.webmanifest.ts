import type { APIRoute } from "astro";
import { buildManifest, manifestResponse } from "@/pwa/apps";
import { getEntryOrThrow } from "@/utils/entry";
import { formatLongFireBrigadeName, formatShortFireBrigadeName } from "@/utils/fireBrigadeName";

export const prerender = true;

export const GET: APIRoute = async () => {
    const settings = await getEntryOrThrow("settings", "data");
    const name = formatLongFireBrigadeName(settings.data.fireBrigadeName);

    return manifestResponse(
        buildManifest("site", {
            name,
            shortName: formatShortFireBrigadeName(settings.data.fireBrigadeName),
            description: `Website der ${name}`,
        }),
    );
};
