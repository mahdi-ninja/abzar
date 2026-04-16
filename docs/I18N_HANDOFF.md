# i18n Handoff: Remaining Work

This document is a complete handoff for finishing the Abzar i18n implementation. It assumes you have zero prior context. Read this entire document before starting any work.

---

## What's Already Done

The i18n infrastructure is fully operational. Two locales are supported: English (`en`) and Persian (`fa`). All URLs require a locale prefix (`/en/...`, `/fa/...`). The root `/` redirects to `/en`. RTL layout works for Persian. Fonts load per-locale. The locale switcher is in the header. The sitemap includes hreflang alternates. PWA manifests exist per locale.

**Fully translated to Persian:**
- All navigation/UI chrome: sidebar, header, breadcrumbs, badges ("Coming Soon", "Beta", "New"), search placeholder, 404 page, tool page section headings ("About this tool", "How to use", "Related Tools")
- All 14 category names and descriptions
- Homepage section headings ("Categories", "Popular Tools", etc.)
- Locale switcher labels
- All ~200 tool names and descriptions (`messages/fa/tools.json`)
- All ~19 tool about/howTo content blocks (`messages/fa/tool-content.json`)
- Shared UI primitives: CopyButton ("Copy", "Copied", toasts), DownloadButton ("Download"), FileDropZone ("Drop files here..."), InputOutputLayout ("Input", "Output") — all use `useTranslations("ui")`
- Site branding strings: tagline, subtitle, description, titleSuffix, site name — all in `messages/*/common.json` under `site.*` namespace
- Homepage hero (tagline/subtitle) and quick-filter pills (translated per locale)
- Search: dual Fuse.js index per locale, results display translated tool names/descriptions
- JSON-LD structured data: locale-aware URL, `inLanguage`, translated `browserRequirements`
- Service worker precache patterns updated for locale-prefixed paths (`{en,fa}/...`)
- `<title>` and meta descriptions use translated strings throughout

**RTL fixes applied:**
- Sliders: `dir="ltr"` on Slider root — prevents CSS `direction: rtl` from breaking drag interaction
- Switches/Toggles: `dir="ltr"` on Switch root — same fix, prevents thumb positioning issues
- Sidebar collapse arrow: `rtl:-scale-x-100` on the chevron SVG — flips arrow to point toward the sidebar edge in RTL
- Site name: displays "ابزار" in Persian via `useTranslations("site")` instead of hardcoded `siteConfig.name`

**Not yet done:**
- OG images (don't exist for either locale)

See `docs/I18N_CHANGELOG.md` for the full list of files changed during the initial implementation.

---

## Completed Work

### Per-tool i18n (done)

All 74 tool components are fully internationalized with English + Persian translations.

**What was done:**
- Created 148 translation files: `messages/en/tool/{slug}.json` and `messages/fa/tool/{slug}.json` for all 74 tools
- Updated all 74 tool components to use `useTranslations("{camelCaseNamespace}")`
- Added `loadToolMessages()` to `i18n/request.ts` to auto-load all per-tool JSON files at server time
- Converted physical CSS directional classes to logical properties for RTL support during translation
- Removed redundant `InputOutputLayout` default label props (component handles translation internally)

**Pattern established:**
- JSON structure: `{ "camelCaseNamespace": { "key": "value" } }` (e.g., `jsonFormatter`, `wordCounter`)
- Interpolation uses ICU MessageFormat: `"Generated {count} passwords"` → `t("generated", { count: 5 })`
- Literal `{` and `}` in messages must be escaped with single quotes: `'{'` and `'}'`
- Any `useCallback` or `useMemo` referencing `t` must include `t` in the dependency array

---

## Remaining Work Items

### 1. Localize OG images (optional, nice to have)

**Current state:** No OG image generation exists. `generateMetadata` in tool pages references `/og/{locale}/{category}/{slug}.png` but the directory is empty.

**What's needed:** Generate OG images (1200x630) per tool per locale, with the tool name and description in the correct language/font.

**Recommended approach — build-time generation with satori:**

Create a script `scripts/generate-og-images.ts` that:
1. Reads translated tool names from `messages/{locale}/tools.json`
2. Uses `satori` + `@resvg/resvg-js` to render JSX to PNG
3. Outputs to `public/og/{locale}/{category}/{slug}.png`
4. Runs as part of `prebuild`

The JSX template should use Vazirmatn font for Persian, Space Grotesk for English. satori supports custom fonts via ArrayBuffer.

**Alternative:** Skip localized OG images for now and use a single branded image as fallback.

---

## File Reference

| File | Role |
|------|------|
| `i18n/routing.ts` | Locales config, prefix strategy |
| `i18n/request.ts` | Server-side message merging (includes `loadToolMessages()` for per-tool files) |
| `i18n/navigation.ts` | Locale-aware Link, useRouter, etc. |
| `messages/en/common.json` | Shared UI strings including `ui.*` and `site.*` (hand-written, committed) |
| `messages/en/home.json` | Homepage strings including `quickFilters` array (hand-written, committed) |
| `messages/en/tools.json` | Tool names/descriptions (generated, gitignored) |
| `messages/en/categories.json` | Category names/descriptions (generated, gitignored) |
| `messages/en/tool-content.json` | About/howTo text (generated, gitignored) |
| `messages/fa/common.json` | Persian UI strings including `ui.*` and `site.*` (translated, committed) |
| `messages/fa/home.json` | Persian homepage strings (translated, committed) |
| `messages/fa/categories.json` | Persian categories (translated, committed) |
| `messages/fa/tools.json` | Persian tool names/descriptions (translated, committed) |
| `messages/fa/tool-content.json` | Persian tool about/howTo (translated, committed) |
| `messages/{locale}/tool/*.json` | Per-tool component strings (74 tools, hand-written, committed) |
| `scripts/generate-messages.ts` | Generates English message files from registry |
| `scripts/generate-sitemap.ts` | Multi-locale sitemap |
| `scripts/generate-sw.mjs` | Service worker build (locale-aware precache patterns) |
| `lib/config.ts` | Site branding — `url` used in metadata, `name`/`tagline`/etc. replaced by `site.*` translations in UI |
| `lib/search.ts` | Fuse.js search — dual index per locale, accepts `locale` param |
| `lib/json-ld.ts` | Structured data — accepts `locale` param, locale-aware URL/language/browserRequirements |
| `components/ui/copy-button.tsx` | Uses `useTranslations("ui")` for all labels/toasts |
| `components/ui/download-button.tsx` | Uses `useTranslations("ui")` for default label |
| `components/ui/file-drop-zone.tsx` | Uses `useTranslations("ui")` for default label and max size text |
| `components/ui/input-output-layout.tsx` | Uses `useTranslations("ui")` for default Input/Output labels |
| `components/ui/slider.tsx` | Has `dir="ltr"` to prevent RTL interaction issues |
| `components/ui/switch.tsx` | Has `dir="ltr"` to prevent RTL thumb positioning issues |
| `components/home-search.tsx` | Locale-aware search + translated result display |
| `components/layout/header.tsx` | Locale-aware search + translated result display + translated site name |
| `components/layout/sidebar.tsx` | Translated site name + RTL-aware collapse arrow |
| `app/[locale]/page.tsx` | Homepage — translated tagline, subtitle, quick-filter pills |
| `app/[locale]/layout.tsx` | Root layout — translated metadata (title, description) |
| `app/[locale]/tools/[category]/[tool-slug]/page.tsx` | Tool page — translated metadata, JSON-LD, per-tool messages via `getMessages()` |

---

## RTL Patterns (for reference when adding new components)

| Widget type | Fix applied | Rationale |
|-------------|------------|-----------|
| Sliders | `dir="ltr"` on root | Spatial widget — drag direction is universal, CSS `direction: rtl` breaks interaction |
| Switches/Toggles | `dir="ltr"` on root | Same — thumb `translate-x` positioning breaks under inherited `direction: rtl` |
| Chevron arrows | `rtl:-scale-x-100` on SVG | Flips arrow to point toward the correct edge in RTL |
| Text alignment | Use `text-start`/`text-end` | Logical properties auto-flip in RTL |
| Margins/padding | Use `ms-*`/`me-*`/`ps-*`/`pe-*` | Logical properties auto-flip in RTL |
| Positioning | Use `inset-s-*`/`inset-e-*` | Logical properties auto-flip in RTL |
| Centering (`left-1/2 -translate-x-1/2`) | Keep physical | Centering is symmetric, doesn't need flipping |

---

## Adding a New Locale

If a third locale is added (e.g. Arabic `ar`):

1. Add `'ar'` to the `locales` array in `i18n/routing.ts`
2. Add `'ar'` to `rtlLocales` in `app/[locale]/layout.tsx` (if RTL)
3. Create `messages/ar/` with all message files including `tool/` directory (copy from `fa/` as starting point)
4. Create `public/manifest.ar.json`
5. Arabic fonts may need adding in `app/[locale]/layout.tsx` and `app/globals.css`
6. Service worker patterns in `scripts/generate-sw.mjs` need updating (`{en,fa,ar}/...`)
7. Add locale-specific Fuse index data in `lib/search.ts` (`toolMessages` map)
8. Add `browserRequirements` translation in `lib/json-ld.ts`
9. All `generateStaticParams` cross-products automatically pick it up
10. Sitemap generation automatically picks it up
