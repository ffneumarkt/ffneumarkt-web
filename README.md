# FF Neumarkt Website

Current project documentation for the FF Neumarkt public website.

## Scope
- Start page with hero image carousel and entry cards
- Vehicle overview and vehicle detail pages
- Team page grouped into command sections
- History page with two tabs: milestones (`Chronik`) and commanders
- Contact page plus legal pages (`Impressum`, `Datenschutz`)

## Stack and architecture
- `Astro 5` with `@astrojs/cloudflare` adapter
- `output: "server"` (hybrid: most routes prerendered, one dynamic route)
- `Tailwind CSS v4` via `@tailwindcss/vite`
- Vehicle gallery implemented in Astro + lightweight browser script
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
  - hero carousel images
- Collection: `vehicles` (`src/content/vehicles/*.yaml`)
  - tactical name, gallery, technical specs, `details` array (amount + item)
- Collection: `team` (`src/content/team/*.yaml`)
  - name, rank, group, function, optional honorary year and photo
- Collection: `chronik` (`src/content/chronik/*.yaml`)
  - year, title, description, optional image, icon type
- Collection: `commanders` (`src/content/commanders/*.yaml`)
  - name, image, DOB/DOD, service periods

Keystatic is configured with `storage.kind = "local"` and is only integrated when `NODE_ENV !== "production"`.

## Local development
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start dev server:
   ```bash
   npm run astro dev
   ```
3. Optional utility targets:
   ```bash
   make dev
   make sync
   ```

Notes:
- Keystatic admin UI is available in non-production runs.
- Path alias `@/` maps to `src/`.

## Build and deploy
Preview:
```bash
make dev
```

Deploy to Cloudflare Workers (using `wrangler.jsonc`):
```bash
npx wrangler deploy
```

Important:
- Cloudflare adapter enables session support and expects KV binding `SESSION`
- PR workflow `.github/workflows/check-wrangler.yml` validates that `wrangler.jsonc` name is `ffneumarkt`.
