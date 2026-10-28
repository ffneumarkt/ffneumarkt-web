# FF Neumarkt Website

Current project documentation for the FF Neumarkt public website.

## Scope

- Start page with client-hydrated interactive sections
- Vehicle overview and vehicle detail pages
- Team page grouped into command sections
- History page with two tabs: chronicle and commanders
- Contact page plus legal pages (`Impressum`, `Datenschutz`)
- Installable as PWA, with the Beförderungspapier generator usable offline

## Stack and architecture

- `Astro 5` with `@astrojs/cloudflare` adapter
- `output: "server"` (hybrid: most routes prerendered, one dynamic route)
- `Tailwind CSS v4` via `@tailwindcss/vite`
- Shared carousel behavior for hero and vehicle galleries via lightweight browser script
- Structured YAML data for vehicle detail content (`.yaml`)
- `Keystatic` CMS config with local file storage
- Self-hosted font via `@fontsource/roboto`

## Route behavior

- Prerendered static routes:
  - `/`
  - `/fahrzeuge`
  - `/mannschaft`
  - `/geschichte`
  - `/kontakt`
  - `/impressum`
  - `/datenschutz`
  - `/atemschutz/befoerderungspapier` (`noindex`, excluded from sitemap, linked in footer only)
  - `/offline` (`noindex`, excluded from sitemap, shown by the service worker without connection)
  - `/manifest.webmanifest`, `/atemschutz/befoerderungspapier/manifest.webmanifest`
- Server-rendered route:
  - `/fahrzeuge/[slug]` (`prerender = false`)

## Content and CMS model

Content is file-based under `src/content` and media under `src/assets`.

- Singleton: `settings` (`src/content/settings/data.yaml`)
  - emergency number, phone, email, social links, address
- Singleton: `landingPage` (`src/content/landingPage/data.yaml`)
  - hero images
- Singleton: `transportDocument` (`src/content/transportDocument/data.yaml`)
  - cylinder size, ADR 1.1.3.6 points limit, default filling station, pre-trip checklist
- Collection: `vehicles` (`src/content/vehicles/*.yaml`)
  - tactical name, gallery, technical specs, `details` array (amount + item)
- Collection: `team` (`src/content/team/*.yaml`)
  - name, rank, group, role, optional honorary year and photo
- Collection: `chronicle` (`src/content/chronicle/*.yaml`)
  - year, title, description, optional image, icon type
- Collection: `commanders` (`src/content/commanders/*.yaml`)
  - name, image, DOB/DOD, service periods

Keystatic is configured with `storage.kind = "local"` and is only integrated when `NODE_ENV !== "production"`.

## Homepage data flow (`src/pages/index.astro`)

- The homepage composes `JourneyHero` and prepares its media data at build time.
- `landingPage.data.heroImages` is sliced to 6 items for the collage and optimized via `astro:assets`.
- The collage images are passed with `{ src, alt }` so the hero can render accessible alt text.
- `JourneyHero` is an Astro component rendered on the server without client hydration.
- `JourneyHero` renders static info/fact content

## PWA (`src/pwa`)

Two installable apps, each with its own manifest (`src/pwa/apps.ts`):

- `FF Neumarkt`: the whole website, scope `/`
- `Beförderungspapier`: only the generator, scope `/atemschutz/befoerderungspapier`, installed from that page

`Layout.astro` links the manifest given by its `app` prop and registers `/sw.js` in production builds.
The integration `src/pwa/integration.ts` writes `dist/sw.js` after the build from the template `src/pwa/sw.js`:

- Precached: the generator page, `/offline` and every file they reference transitively
  (JS chunks including the lazily loaded pdf-lib, CSS, fonts, images, form PDF, manifest and icons)
- The cache version is a hash of the precached files, so every relevant deploy installs a new service worker.
  It takes over once all windows of the old one are closed.
- Precached files are served from the cache; other pages come from the network and fall back to `/offline`.
- There is no service worker in `astro dev`.

Icons in `public/icons` are generated from `public/Logo_ffneumarkt_grey.png` with `make icons` (Python with Pillow).

## Local development

Option A: Docker (recommended)

- Start dev server in a container:

  ```bash
  make dev
  ```

- Open:

  ```bash
  http://localhost:4321/
    ```

Option B: Local Node

- Install dependencies:

   ```bash
   npm install
   ```

- Start dev server:

   ```bash
   npm run astro dev
   ```

Optional utility targets:

```bash
make sync
make build   # production build in Docker
make test    # unit tests in Docker
```

Notes:

- Keystatic admin UI is available in non-production runs.
- Path alias `@/` maps to `src/`.

## Build and deploy

Build:

```bash
npx astro build
```

Deploy to Cloudflare Workers (using `wrangler.jsonc`):

```bash
npx wrangler deploy
```

Important:

- Cloudflare adapter enables session support and expects KV binding `SESSION`
- PR workflow `.github/workflows/check-wrangler.yml` validates that `wrangler.jsonc` name is `ffneumarkt`.
