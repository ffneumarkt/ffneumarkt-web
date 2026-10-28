// Service worker template. src/pwa/integration.ts fills in the placeholders and writes it to dist/sw.js.
// Precached files (the transport document generator and the offline page) are served from the cache,
// all other pages come from the network and fall back to the offline page.

const VERSION = "__VERSION__";
const PRECACHE = ["__PRECACHE__"];
const TRANSPORT_DOCUMENT_PATH = "__TRANSPORT_DOCUMENT_PATH__";
const OFFLINE_PATH = "__OFFLINE_PATH__";

const CACHE_PREFIX = "ffneumarkt-precache-";
const CACHE = CACHE_PREFIX + VERSION;

self.addEventListener("install", (event) => {
    // The new version takes over once all windows of the old one are closed, so a page that is
    // already open never loses the chunks it still has to load.
    event.waitUntil(
        caches.open(CACHE).then((cache) => cache.addAll(PRECACHE.map((path) => new Request(path, { cache: "reload" })))),
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) => Promise.all(keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE).map((key) => caches.delete(key))))
            .then(() => self.clients.claim()),
    );
});

// Cloudflare redirects the page to its trailing-slash URL; the cache holds only that one.
const normalizePath = (path) => (path === TRANSPORT_DOCUMENT_PATH ? `${path}/` : path);

const fromCache = (path) => caches.open(CACHE).then((cache) => cache.match(path, { ignoreSearch: true }));

async function handleNavigation(request, path) {
    if (PRECACHE.includes(path)) {
        return (await fromCache(path)) ?? fetch(request);
    }
    try {
        return await fetch(request);
    } catch (error) {
        const offline = await fromCache(`${OFFLINE_PATH}/`);
        if (offline) {
            return offline;
        }
        throw error;
    }
}

self.addEventListener("fetch", (event) => {
    const { request } = event;
    const url = new URL(request.url);
    if (request.method !== "GET" || url.origin !== self.location.origin) {
        return;
    }

    const path = normalizePath(url.pathname);
    if (request.mode === "navigate") {
        event.respondWith(handleNavigation(request, path));
    } else if (PRECACHE.includes(path)) {
        event.respondWith(fromCache(path).then((response) => response ?? fetch(request)));
    }
});
