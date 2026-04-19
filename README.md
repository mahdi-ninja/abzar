# Abzar

200+ free browser-based tools. No signup, no server, everything runs in your browser.

Abzar (ابزار — "tools" in Persian) is a collection of utility tools that run entirely client-side. JSON formatters, image editors, calculators, productivity tools, and more — all in one place with zero backend.

## Tech Stack

- **Next.js 16** (App Router, `output: "export"` for fully static builds)
- **TypeScript** + **Tailwind CSS v4**
- **shadcn/ui** (Base UI variant, not Radix)
- **next-intl** — i18n with locale routing (`/en`, `/fa`, `/zh`, `/es`), RTL support, translation files
- **Theme:** locale-aware font stacks (Space Grotesk / Source Serif 4 / Source Code Pro by default; Vazirmatn / Noto Naskh Arabic for Persian; Noto Sans SC for Chinese)
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
  routing.ts                        — Locales (en, fa, zh, es), default locale, prefix strategy
  request.ts                        — Server-side message loading
  navigation.ts                     — Locale-aware Link, useRouter, usePathname, redirect

messages/
  en/                               — English translations (tools.json, categories.json, tool-content.json are generated)
  en/tool/                          — Per-tool component strings (hand-written, one file per tool)
  fa/                               — Persian translations
  fa/tool/                          — Persian per-tool component strings
  zh/                               — Chinese translations
  es/                               — Spanish translations

scripts/
  generate-messages.ts              — Extract English messages from registry into JSON
  generate-sitemap.ts               — Multi-locale sitemap with hreflang alternates

components/
  layout/                           — Shell (sidebar, header, breadcrumbs, tool-page, error-boundary)
  locale-switcher.tsx               — Language dropdown (driven by `routing.locales`)
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
4. **Translations** — add per-tool UI strings under every locale that ships that tool (today: `en`, `fa`; `zh`/`es` currently ship global messages only) (see [i18n](#per-tool-i18n) below)

Tool statuses: `planned` | `live` | `beta` | `deprecated` | `featured`

English translation messages (`tools.json`, `categories.json`, `tool-content.json`) are auto-generated from the registry at dev/build time. Other locales are maintained manually.

## i18n

All URLs include a locale prefix (`/en/tools/text/word-counter`, `/fa/tools/text/word-counter`, `/zh/tools/text/word-counter`, `/es/tools/text/word-counter`). The root `/` redirects to `/en`.

- **Supported locales:** English (`en`), Persian (`fa`), Chinese (`zh`), Spanish (`es`)
- **Routing source of truth:** `i18n/routing.ts`
- **Locale behavior source of truth:** `lib/locale-config.ts` for direction (`ltr`/`rtl`) and locale-specific font stacks
- **Font token remapping:** `app/globals.css` maps locale-specific `next/font` variables back onto the shared `--font-sans` / `--font-serif` / `--font-mono` tokens via `:lang(...)` rules
- **RTL:** `fa` is currently RTL; `lib/locale-config.ts` also reserves RTL handling for `ar` and `he` if added later
- **Fonts:** default locales use Space Grotesk / Source Serif 4 / Source Code Pro; Persian uses Vazirmatn + Noto Naskh Arabic; Chinese uses Noto Sans SC
- **Translations:** Hand-written UI strings in `messages/{locale}/common.json` and `home.json`; generated tool/category names from the registry
- **Per-locale manifests:** `public/manifest.{locale}.json`
- **Locale switcher:** Dropdown in the header, rendered from `routing.locales`

### Adding a New Language

1. Add the locale code to `i18n/routing.ts` `locales`.
2. Add global messages under `messages/{locale}/`:
   - `common.json`
   - `home.json`
   - `categories.json`
   - `tools.json`
   - `tool-content.json`
3. Add the locale label to `localeSwitcher` in each `messages/*/common.json` so it appears in the language menu.
4. Update `lib/locale-config.ts`:
   - add the locale to `rtlLocales` if it is right-to-left
   - add a `getLocaleFontVars` case if it needs a custom font stack
5. If the locale needs custom fonts, update the `:lang(...)` remap in `app/globals.css` so the shared theme tokens point at the new locale-specific font variables.
6. Add `public/manifest.{locale}.json`.
7. If the locale should have translated per-tool UI, add `messages/{locale}/tool/{slug}.json` files. `i18n/request.ts` auto-loads anything present in that folder.
8. Verify the locale in dev by opening `/{locale}` and switching routes with the locale switcher.

### Per-tool i18n

Every tool component uses `useTranslations` from `next-intl` for all user-facing strings. Translation files live at `messages/{locale}/tool/{slug}.json` and are auto-loaded by `i18n/request.ts` when present.

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
3. Add equivalent files for any other locales that should ship that tool with localized UI
4. In the component, use `const t = useTranslations("myTool")` and replace hardcoded strings with `t("key")` or `t("key", { count: n })` for interpolation

## Shared UI Primitives

Use these instead of reimplementing common patterns:

- `InputOutputLayout` — responsive two-pane (side-by-side desktop, stacked mobile)
- `CopyButton` — clipboard copy + toast notification
- `DownloadButton` — download blob/string as file
- `FileDropZone` — drag-and-drop with click fallback
- `Tabs`, `Select`, `Slider`, `Switch` — from shadcn/ui
