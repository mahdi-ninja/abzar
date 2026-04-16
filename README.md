# Abzar

200+ free browser-based tools. No signup, no server, everything runs in your browser.

Abzar (ابزار — "tools" in Persian) is a collection of utility tools that run entirely client-side. JSON formatters, image editors, calculators, productivity tools, and more — all in one place with zero backend.

## Tech Stack

- **Next.js 16** (App Router, `output: "export"` for fully static builds)
- **TypeScript** + **Tailwind CSS v4**
- **shadcn/ui** (Base UI variant, not Radix)
- **next-intl** — i18n with locale routing (`/en`, `/fa`), RTL support, translation files
- **Theme:** "playable" amber theme (Space Grotesk / Source Serif 4 / Source Code Pro; Vazirmatn / Noto Naskh Arabic for Persian)
- **Search:** Fuse.js for fuzzy search across all tools
- **Testing:** Vitest
- **Deploy:** Cloudflare Pages via wrangler

## Development

```bash
npm install
npm run dev
```

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (auto-generates English message files via `predev`) |
| `npm run build` | Build static site to `out/` (auto-generates messages + sitemap via `prebuild`) |
| `npm run test` | Run unit tests |
| `npm run lint` | Run ESLint |
| `npm run check` | Lint + tests |
| `npm run deploy` | Build + deploy to Cloudflare Pages |

## Project Structure

```
app/
  page.tsx                          — Root redirect: / → /en
  not-found.tsx                     — Root 404 page
  [locale]/
    layout.tsx                      — Root layout (html lang/dir, fonts, providers)
    page.tsx                        — Homepage (search, categories, featured)
    not-found.tsx                   — Localized 404 page
    tools/[category]/
      page.tsx                      — Category listing (active + coming soon)
      [tool-slug]/page.tsx          — Tool page (metadata, JSON-LD, dynamic import)

i18n/
  routing.ts                        — Locales (en, fa), default locale, prefix strategy
  request.ts                        — Server-side message loading
  navigation.ts                     — Locale-aware Link, useRouter, usePathname, redirect

messages/
  en/                               — English translations (tools.json, categories.json, tool-content.json are generated)
  en/tool/                          — Per-tool component strings (hand-written, one file per tool)
  fa/                               — Persian translations
  fa/tool/                          — Persian per-tool component strings

scripts/
  generate-messages.ts              — Extract English messages from registry into JSON
  generate-sitemap.ts               — Multi-locale sitemap with hreflang alternates

components/
  layout/                           — Shell (sidebar, header, breadcrumbs, tool-page, error-boundary)
  locale-switcher.tsx               — Language dropdown (en/fa)
  ui/                               — shadcn/ui + custom primitives
  tools/{slug}/                     — One folder per tool, self-contained

lib/
  config.ts                         — Site branding (name, url, tagline) — single source of truth
  tools-registry.ts                 — All 202 tools as pure metadata array
  categories.ts                     — 14 category definitions
  search.ts                         — Fuse.js search over tools
  json-ld.ts                        — WebApplication schema generator
  tool-content.ts                   — About/howTo text per tool
  use-local-storage.ts              — localStorage hook with try/catch
```

## Adding a Tool

Touch exactly 4 places:

1. **Registry** — `lib/tools-registry.ts`: add metadata entry with status `"live"`
2. **Component** — `components/tools/{slug}/index.tsx`: the interactive tool (default export, uses `useTranslations`)
3. **Dynamic import** — `app/[locale]/tools/[category]/[tool-slug]/page.tsx`: add to `toolComponents` map
4. **Translations** — `messages/en/tool/{slug}.json` and `messages/fa/tool/{slug}.json`: per-tool UI strings (see [i18n](#per-tool-i18n) below)

Tool statuses: `planned` | `live` | `beta` | `deprecated` | `featured`

English translation messages (`tools.json`, `categories.json`, `tool-content.json`) are auto-generated from the registry at dev/build time. Persian translations in `messages/fa/` need manual updates.

## i18n

All URLs include a locale prefix (`/en/tools/text/word-counter`, `/fa/tools/text/word-counter`). The root `/` redirects to `/en`.

- **Supported locales:** English (`en`), Persian (`fa`)
- **RTL:** Persian pages render with `dir="rtl"` and CSS logical properties
- **Fonts:** Persian uses Vazirmatn (sans), Noto Naskh Arabic (serif), Vazir Code (mono)
- **Translations:** Hand-written UI strings in `messages/{locale}/common.json` and `home.json`; generated tool/category names from the registry
- **Locale switcher:** Dropdown in the header

### Per-tool i18n

Every tool component uses `useTranslations` from `next-intl` for all user-facing strings. Translation files live at `messages/{locale}/tool/{slug}.json` and are auto-loaded by `i18n/request.ts`.

To add translations for a new tool:

1. Create `messages/en/tool/{slug}.json` with a camelCase namespace wrapping all strings:
   ```json
   {
     "myTool": {
       "generate": "Generate",
       "clear": "Clear",
       "resultCount": "Found {count} results"
     }
   }
   ```
2. Create `messages/fa/tool/{slug}.json` with the same keys, Persian values
3. In the component, use `const t = useTranslations("myTool")` and replace hardcoded strings with `t("key")` or `t("key", { count: n })` for interpolation

## Shared UI Primitives

Use these instead of reimplementing common patterns:

- `InputOutputLayout` — responsive two-pane (side-by-side desktop, stacked mobile)
- `CopyButton` — clipboard copy + toast notification
- `DownloadButton` — download blob/string as file
- `FileDropZone` — drag-and-drop with click fallback
- `Tabs`, `Select`, `Slider`, `Switch` — from shadcn/ui
