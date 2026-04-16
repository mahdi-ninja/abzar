# i18n Implementation Changelog

Summary of all changes made to add internationalization (English + Persian) to Abzar.

---

## Dependencies

- **Added** `next-intl` — i18n framework for Next.js (locale routing, message loading, translation hooks)
- **Added** `vazir-code-font` — self-hosted Persian monospace font (Vazir Code)

---

## New Files

### i18n Configuration

| File | Purpose |
|------|---------|
| `i18n/routing.ts` | Defines supported locales (`en`, `fa`), default locale (`en`), and `localePrefix: 'always'` |
| `i18n/request.ts` | Server-side message loading — merges `common.json`, `home.json`, `categories.json`, `tools.json`, `tool-content.json` per locale |
| `i18n/navigation.ts` | Exports locale-aware `Link`, `useRouter`, `usePathname`, `redirect`, `getPathname` from `next-intl/navigation` |

### Message Files

| File | Type | Purpose |
|------|------|---------|
| `messages/en/common.json` | Hand-written, committed | Shared UI strings: nav, breadcrumbs, 404, tool page headings, category page labels, locale switcher |
| `messages/en/home.json` | Hand-written, committed | Homepage strings: "Categories", "Popular Tools", etc. |
| `messages/en/tools.json` | Generated, gitignored | Tool names and descriptions extracted from `lib/tools-registry.ts` |
| `messages/en/categories.json` | Generated, gitignored | Category names and descriptions extracted from `lib/categories.ts` |
| `messages/en/tool-content.json` | Generated, gitignored | About/howTo text extracted from `lib/tool-content.ts` |
| `messages/fa/common.json` | Hand-translated, committed | Persian UI strings |
| `messages/fa/home.json` | Hand-translated, committed | Persian homepage strings |
| `messages/fa/categories.json` | Hand-translated, committed | Persian category names and descriptions |
| `messages/fa/tools.json` | Placeholder (English), committed | Needs human translation |
| `messages/fa/tool-content.json` | Placeholder (English), committed | Needs human translation |

### Scripts

| File | Purpose |
|------|---------|
| `scripts/generate-messages.ts` | Extracts English messages from registry/categories/tool-content into `messages/en/` (run via `predev`/`prebuild`) |
| `scripts/generate-sitemap.ts` | Generates `public/sitemap.xml` with multi-locale URLs and `hreflang` alternates (run via `prebuild`) |

### App Pages

| File | Purpose |
|------|---------|
| `app/page.tsx` | Root redirect: `/` → `/en` |
| `app/not-found.tsx` | Root 404 page (plain HTML, no providers) |
| `app/[locale]/layout.tsx` | Root layout with `<html lang dir>`, fonts, `NextIntlClientProvider`, all providers |
| `app/[locale]/page.tsx` | Homepage (moved from `app/page.tsx`, uses `getTranslations`) |
| `app/[locale]/not-found.tsx` | Localized 404 (rendered inside locale layout with providers) |
| `app/[locale]/tools/[category]/page.tsx` | Category page (moved, uses translations for all strings) |
| `app/[locale]/tools/[category]/[tool-slug]/page.tsx` | Tool page (moved, localized metadata/JSON-LD, merged `NextIntlClientProvider`) |

### Components

| File | Purpose |
|------|---------|
| `components/locale-switcher.tsx` | Language dropdown in the header (uses `Select` from shadcn/ui) |

### PWA Manifests

| File | Purpose |
|------|---------|
| `public/manifest.en.json` | English PWA manifest (`lang: "en"`, `dir: "ltr"`) |
| `public/manifest.fa.json` | Persian PWA manifest (`lang: "fa"`, `dir: "rtl"`, translated name/description) |

---

## Modified Files

### Configuration

| File | Change |
|------|--------|
| `next.config.ts` | Wrapped with `createNextIntlPlugin` from `next-intl/plugin` |
| `package.json` | Added `predev` (generate messages), `prebuild` (generate messages + sitemap) scripts |
| `.gitignore` | Added `messages/en/tools.json`, `messages/en/categories.json`, `messages/en/tool-content.json` |

### Deleted

| File | Reason |
|------|--------|
| `app/layout.tsx` | Replaced by `app/[locale]/layout.tsx` |

### Fonts & CSS

| File | Change |
|------|--------|
| `app/globals.css` | Added `@import 'vazir-code-font/dist/font-face.css'` and `[lang="fa"]` CSS overrides for `--font-sans`, `--font-serif`, `--font-mono` |
| `app/[locale]/layout.tsx` | Loads Vazirmatn (sans) and Noto Naskh Arabic (serif) Google Fonts for Persian; applies font classes conditionally based on locale |

### Navigation & Links

All `next/link` and `next/navigation` imports replaced with `@/i18n/navigation` equivalents in:

- `components/layout/header.tsx`
- `components/layout/sidebar.tsx`
- `components/layout/breadcrumbs.tsx`
- `components/layout/tool-page.tsx`
- `components/home-search.tsx`

### Translated Strings

All hardcoded English strings replaced with `useTranslations()` / `getTranslations()` calls in:

| File | Strings translated |
|------|-------------------|
| `components/layout/header.tsx` | Search placeholder, "No tools found", "Offline", "Install Abzar", "Open navigation", "Navigation", "Coming Soon" |
| `components/layout/sidebar.tsx` | Category names, "Expand/Collapse sidebar" aria labels |
| `components/layout/breadcrumbs.tsx` | "Home", category names |
| `components/layout/tool-page.tsx` | "About this tool", "How to use", "Related Tools" headings; tool/category names from translations |
| `components/home-search.tsx` | Search placeholder, "No tools found", "Coming Soon" |
| `app/[locale]/page.tsx` | "Categories", "Popular Tools", "{n} tools", "New", category/tool names |
| `app/[locale]/tools/[category]/page.tsx` | "Home", "Coming Soon", "Beta", "New", category/tool names |
| `app/[locale]/tools/[category]/[tool-slug]/page.tsx` | "Coming Soon", "This tool is currently under development" |

### Locale Switcher

- `components/layout/header.tsx` — Added `<LocaleSwitcher />` next to the theme toggle

### Localized Metadata & SEO

- `app/[locale]/layout.tsx` — `generateMetadata` adds `alternates.languages` with hreflang for all locales; per-locale manifest link
- `app/[locale]/tools/[category]/page.tsx` — `generateMetadata` uses `getTranslations` for localized title/description + hreflang alternates
- `app/[locale]/tools/[category]/[tool-slug]/page.tsx` — `generateMetadata` uses `getTranslations` for localized title/description/OG/JSON-LD + hreflang alternates
- `lib/json-ld.ts` — `generateToolJsonLd` accepts optional `overrides` param `{ name, description }` for translated values

### RTL Support

#### `<html>` attributes

`app/[locale]/layout.tsx` sets `lang` and `dir` on `<html>` based on locale:
```html
<!-- English -->
<html lang="en" dir="ltr">
<!-- Persian -->
<html lang="fa" dir="rtl">
```

#### Mobile Sheet

`components/layout/header.tsx` — `SheetContent` side is dynamic: `side={dir === 'rtl' ? 'right' : 'left'}`

#### Directional CSS → Logical Properties

Converted ~50 physical directional Tailwind classes to logical equivalents across UI primitives and tool components:

| Physical | Logical | Files affected |
|----------|---------|----------------|
| `ml-*` | `ms-*` | json-formatter, kanban, input-group |
| `mr-*` | `me-*` | json-formatter, mortgage-calculator, algorithm-visualizer, input-group |
| `pl-*` | `ps-*` | json-formatter, select, input-group, search-input, button, badge, tabs, command |
| `pr-*` | `pe-*` | emoji-search, habit-tracker, drum-machine, select, button, badge, tabs, tooltip |
| `text-left` | `text-start` | tool-error-boundary, mortgage-calculator, soundboard, habit-tracker, regex-tester, chmod-calculator, contrast-checker, select |
| `text-right` | `text-end` | mortgage-calculator, drum-machine, invoice-generator, pdf-merger, gradient-generator |
| `right-*` | `inset-e-*` | sheet (close button), dialog (close button), select (check icon), soundboard |
| `left-*` | `inset-s-*` | search-input (icon) |
| `border-l` | `border-s` | json-formatter |
| `border-r` | `border-e` | sidebar |

**Exceptions preserved:** `left-1/2` + `-translate-x-1/2` centering in dialog, `translate-x` animations in sheet, tooltip arrow positioning — all kept as physical properties.

### Static Rendering

Added `setRequestLocale(locale)` calls in all server pages/layouts for static export compatibility:

- `app/[locale]/layout.tsx`
- `app/[locale]/page.tsx`
- `app/[locale]/tools/[category]/page.tsx`
- `app/[locale]/tools/[category]/[tool-slug]/page.tsx`

### Static Params

All `generateStaticParams` updated to cross-product with locales:

```ts
// Before
return tools.map(t => ({ category: t.category, 'tool-slug': t.slug }));

// After
return routing.locales.flatMap(locale =>
  tools.map(t => ({ locale, category: t.category, 'tool-slug': t.slug }))
);
```

---

## URL Structure

All URLs always include the locale prefix:

| URL | Description |
|-----|-------------|
| `/` | Redirects to `/en` |
| `/en` | English homepage |
| `/en/tools/text/word-counter` | English tool page |
| `/fa` | Persian homepage |
| `/fa/tools/text/word-counter` | Persian tool page |

---

## Build Pipeline

```
predev:   tsx scripts/generate-messages.ts
prebuild: tsx scripts/generate-messages.ts && tsx scripts/generate-sitemap.ts
build:    next build && node scripts/generate-sw.mjs
```

Build output: 438 static pages (219 per locale).

---

## Completed Since Initial Implementation

- **Persian tool translations:** `messages/fa/tools.json` (all ~200 tool names/descriptions) and `messages/fa/tool-content.json` (all 19 about/howTo sections) fully translated
- **Shared UI primitives:** CopyButton, DownloadButton, FileDropZone, InputOutputLayout now use `useTranslations("ui")` with keys in `common.json`
- **Site branding:** tagline, subtitle, description, titleSuffix, site name all translatable via `site.*` keys in `common.json`; homepage hero, `<title>`, meta descriptions, OG titles all use translations
- **Locale-aware search:** `lib/search.ts` builds dual Fuse.js indexes (one per locale); `home-search.tsx` and `header.tsx` pass locale and display translated tool names/descriptions
- **Homepage quick-filter pills:** translated via `home.quickFilters` array in `home.json`
- **JSON-LD localization:** `generateToolJsonLd` accepts `locale` param — sets `inLanguage`, locale-prefixed URL, translated `browserRequirements`
- **Service worker:** precache patterns updated to `{en,fa}/` prefixed paths
- **RTL fixes:** Slider and Switch use `dir="ltr"` to prevent interaction issues; sidebar chevron uses `rtl:-scale-x-100`; site name displays "ابزار" in Persian

## Per-tool Component i18n (completed)

All 74 tool components fully internationalized with English + Persian translations.

### Infrastructure

| File | Change |
|------|--------|
| `i18n/request.ts` | Added `loadToolMessages()` — reads all `messages/{locale}/tool/*.json` files via `readdirSync` and merges them into the global message object |
| `app/[locale]/tools/[category]/[tool-slug]/page.tsx` | Simplified to `const mergedMessages = await getMessages()` — per-tool messages are now loaded globally via `request.ts` |

### Files Created (148 JSON files)

For each of the 74 tools, created:
- `messages/en/tool/{slug}.json` — English strings with camelCase namespace
- `messages/fa/tool/{slug}.json` — Persian translations with same keys

### Files Modified (74 components)

All tool components in `components/tools/*/index.tsx` updated to:
- Import `useTranslations` from `next-intl`
- Call `const t = useTranslations("{camelCaseNamespace}")` at the top of the component
- Replace all hardcoded strings with `t("key")` or `t("key", { var: value })`
- Add `t` to `useCallback`/`useMemo` dependency arrays where referenced

Additional cleanups during translation:
- Removed redundant `inputLabel="Input"` / `outputLabel="Output"` props from `InputOutputLayout` (defaults are already translated via `useTranslations("ui")`)
- Removed unused `SelectValue` imports where `<span>{t(...)}</span>` replaced it in `SelectTrigger`
- Converted physical CSS directional classes to logical properties (`text-left` → `text-start`, `ml-*` → `ms-*`, etc.)

### Convention

- **Namespace**: camelCase of the slug (e.g., `json-formatter` → `jsonFormatter`, `game-of-life` → `gameOfLife`)
- **JSON structure**: `{ "camelCaseNamespace": { "key": "value" } }`
- **Interpolation**: ICU MessageFormat — `"Generated {count} passwords"` → `t("generated", { count: 5 })`
- **Literal braces**: Escape with single quotes — `'{'` and `'}'`
- **Auto-loading**: `i18n/request.ts` reads all files in `messages/{locale}/tool/` automatically — no per-tool wiring needed

## Still Needed

- Localized OG images (optional — no generation exists yet)
