// The two installable apps: the whole website and the transport document generator on its own.

export type AppKey = "site" | "transportDocument";

export const TRANSPORT_DOCUMENT_PATH = "/atemschutz/befoerderungspapier";
export const OFFLINE_PATH = "/offline";

// Same as --color-accent in src/styles/theme.css.
export const THEME_COLOR = "#AF2B1E";
export const BACKGROUND_COLOR = "#ffffff";

interface App {
    manifestPath: string;
    iconName: string;
    appleTouchIcon: string;
    startUrl: string;
    // Without trailing slash, so the generator page is in scope with and without one.
    scope: string;
}

export const apps: Record<AppKey, App> = {
    site: {
        manifestPath: "/manifest.webmanifest",
        iconName: "site",
        // Not at the conventional /apple-touch-icon.png: iOS prefers that over the page's link,
        // so the transport document app would get the site's icon.
        appleTouchIcon: "/icons/site-apple-touch.png",
        startUrl: "/",
        scope: "/",
    },
    transportDocument: {
        manifestPath: `${TRANSPORT_DOCUMENT_PATH}/manifest.webmanifest`,
        iconName: "transport-document",
        appleTouchIcon: "/icons/transport-document-apple-touch.png",
        startUrl: `${TRANSPORT_DOCUMENT_PATH}/`,
        scope: TRANSPORT_DOCUMENT_PATH,
    },
};

interface ManifestText {
    name: string;
    shortName: string;
    description: string;
}

// The site's texts come from the settings, see src/pages/manifest.webmanifest.ts.
export const transportDocumentText: ManifestText = {
    name: "Beförderungspapier Pressluftflaschen",
    shortName: "Beförderungspapier",
    description: "Beförderungspapier für Pressluftflaschen ausfüllen und drucken, auch offline.",
};

export function buildManifest(app: AppKey, text: ManifestText) {
    const { iconName, startUrl, scope } = apps[app];
    const icons = [192, 512].flatMap((size) => [
        { src: `/icons/${iconName}-${size}.png`, sizes: `${size}x${size}`, type: "image/png", purpose: "any" },
        {
            src: `/icons/${iconName}-maskable-${size}.png`,
            sizes: `${size}x${size}`,
            type: "image/png",
            purpose: "maskable",
        },
    ]);

    return {
        id: startUrl,
        name: text.name,
        short_name: text.shortName,
        description: text.description,
        lang: "de-AT",
        start_url: startUrl,
        scope,
        display: "standalone",
        theme_color: THEME_COLOR,
        background_color: BACKGROUND_COLOR,
        icons,
    };
}

export const manifestResponse = (manifest: ReturnType<typeof buildManifest>) =>
    new Response(JSON.stringify(manifest), {
        headers: { "Content-Type": "application/manifest+json" },
    });
