# Abzar

200+ free browser-based tools. No signup, no server, everything runs in your browser.

Abzar (ابزار — "tools" in Persian) is a collection of utility tools that run entirely client-side. JSON formatters, image editors, calculators, productivity tools, and more — all in one place with zero backend.

## Tech Stack

- **Next.js 16** (App Router, `output: "export"` for fully static builds)
- **TypeScript** + **Tailwind CSS v4**
- **shadcn/ui** (Base UI variant, not Radix)
- **Theme:** "playable" amber theme (Space Grotesk / Source Serif 4 / Source Code Pro)
- **Search:** uFuzzy for fuzzy search across all tools
- **Testing:** Vitest
- **Deploy:** Cloudflare Pages via wrangler

## Development

```bash
npm install
npm run dev
```

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Build static site to `out/` |
| `npm run test` | Run unit tests |
| `npm run lint` | Run ESLint |
| `npm run deploy` | Build + deploy to Cloudflare Pages |

## Project Structure

```
app/
  layout.tsx              — Root layout, theme provider, app shell
  page.tsx                — Homepage (hero, search, categories, featured)
  tools/[category]/
    page.tsx              — Category listing (active tools, then coming soon)
    [tool-slug]/page.tsx  — Tool page wrapper (metadata, JSON-LD, dynamic import)

components/
  layout/                 — Shell (sidebar, header, breadcrumbs, tool-page, error-boundary)
  ui/                     — shadcn/ui + custom primitives
  tools/{slug}/           — One folder per tool, self-contained

lib/
  config.ts               — Site branding (name, url, tagline) — single source of truth
  tools-registry.ts       — All 202 tools as pure metadata array
  categories.ts           — 14 category definitions
  search.ts               — uFuzzy search over tools
  json-ld.ts              — WebApplication schema generator
  tool-content.ts         — About/howTo text per tool
  use-local-storage.ts    — localStorage hook with try/catch
```

## Adding a Tool

Touch exactly 3 places:

1. **Registry** — `lib/tools-registry.ts`: add metadata entry with status `"live"`
2. **Component** — `components/tools/{slug}/index.tsx`: the interactive tool (default export)
3. **Dynamic import** — `app/tools/[category]/[tool-slug]/page.tsx`: add to `toolComponents` map

Tool statuses: `planned` | `live` | `beta` | `deprecated` | `featured`

## Shared UI Primitives

Use these instead of reimplementing common patterns:

- `InputOutputLayout` — responsive two-pane (side-by-side desktop, stacked mobile)
- `CopyButton` — clipboard copy + toast notification
- `DownloadButton` — download blob/string as file
- `FileDropZone` — drag-and-drop with click fallback
- `Tabs`, `Select`, `Slider`, `Switch` — from shadcn/ui
