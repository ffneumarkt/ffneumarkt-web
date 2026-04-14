# FF Neumarkt Website

Current project documentation for the FF Neumarkt public website.

## Scope
- Start page with client-hydrated interactive sections
- Vehicle overview and vehicle detail pages
- Team page grouped into command sections
- History page with two tabs: chronicle and commanders
- Contact page plus legal pages (`Impressum`, `Datenschutz`)

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
- Server-rendered route:
  - `/fahrzeuge/[slug]` (`prerender = false`)

## Content and CMS model
Content is file-based under `src/content` and media under `src/assets`.

- Singleton: `settings` (`src/content/settings/data.yaml`)
  - emergency number, phone, email, social links, address
- Singleton: `landingPage` (`src/content/landingPage/data.yaml`)
  - hero images
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

## Local development
Option A: Docker (recommended)
1. Start dev server in a container:
   ```bash
   make dev
   ```
2. Open:
   ```bash
   http://localhost:4321/
   ```

Option B: Local Node
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start dev server:
   ```bash
   npm run astro dev
   ```

Optional utility targets:
```bash
make sync
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
