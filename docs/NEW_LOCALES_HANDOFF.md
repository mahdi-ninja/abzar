# Handoff: Add Mandarin Chinese (zh) and Spanish (es) Locales

This document is a complete handoff for adding two new locales to Abzar. It assumes you have zero prior context beyond the existing i18n infrastructure described here. Read this entire document before starting any work.

---

## Current State

Two locales are fully operational: English (`en`) and Persian (`fa`). All 74 tool components, all UI chrome, all tool names/descriptions, and all categories are translated in both languages. RTL layout works for Persian. Per-tool translation files are auto-loaded by `i18n/request.ts`.

**Neither Mandarin nor Spanish requires RTL support.** Both are LTR like English, so no directional CSS changes are needed.

---

## Overview of Changes

| Area | Files | Difficulty |
|------|-------|------------|
| Locale registration | 1 file | Trivial |
| Locale switcher labels | 2 files | Trivial |
| PWA manifests | 2 new files | Trivial |
| Service worker precache | 1 file | Trivial |
| Search index | 1 file | Easy |
| JSON-LD | 1 file | Easy |
| Fonts (Chinese only) | 2 files | Moderate |
| Global message files (per locale) | 5 new files each | Moderate (translation) |
| Per-tool message files (per locale) | 74 new files each | Large (translation) |

**Total new files:** ~162 (2 manifests + 5 global messages × 2 + 74 tool messages × 2)
**Total modified files:** 7

---

## Step-by-step

### 1. Register the new locales

**`i18n/routing.ts`** — add `'zh'` and `'es'` to the `locales` array:

```ts
export const locales = ['en', 'fa', 'zh', 'es'] as const;
```

That's it. `generateStaticParams`, sitemap generation, and URL routing all read from this array automatically. Both new locales will get URL prefixes (`/zh/...`, `/es/...`).

### 2. Add locale switcher labels

Every locale's `common.json` needs labels for the new locales so the dropdown displays correctly.

**`messages/en/common.json`** — add to `localeSwitcher`:
```json
"localeSwitcher": {
  "label": "Language",
  "en": "English",
  "fa": "فارسی",
  "zh": "中文",
  "es": "Español"
}
```

**`messages/fa/common.json`** — add the same two keys:
```json
"localeSwitcher": {
  "label": "زبان",
  "en": "English",
  "fa": "فارسی",
  "zh": "中文",
  "es": "Español"
}
```

The Chinese and Spanish `common.json` files (created in step 6) will also need all four labels.

### 3. Add Chinese fonts

Spanish uses Latin characters — the existing Space Grotesk / Source Serif 4 / Source Code Pro fonts cover it. **No font changes for Spanish.**

Mandarin requires CJK-capable fonts. Google Fonts serves these as subset slices, so the browser only downloads glyphs actually used on the page.

**`app/[locale]/layout.tsx`** — add the Chinese font import and update the `fontVars` logic:

```ts
import {
  Space_Grotesk,
  Source_Serif_4,
  Source_Code_Pro,
  Vazirmatn,
  Noto_Naskh_Arabic,
  Noto_Sans_SC,        // ← ADD
} from "next/font/google";

// Chinese font
const notoSansSC = Noto_Sans_SC({
  variable: "--font-sans-zh",
  subsets: ["latin"],       // Google Fonts auto-serves CJK subsets via unicode-range
  weight: ["400", "500", "700"],
});
```

Update the `fontVars` assignment (currently a ternary for `fa` vs default):

```ts
function getFontVars(locale: string) {
  switch (locale) {
    case "fa":
      return `${vazirmatn.variable} ${notoNaskhArabic.variable} ${sourceCodePro.variable}`;
    case "zh":
      return `${notoSansSC.variable} ${sourceSerif.variable} ${sourceCodePro.variable}`;
    default:
      return `${spaceGrotesk.variable} ${sourceSerif.variable} ${sourceCodePro.variable}`;
  }
}

// In the component:
const fontVars = getFontVars(locale);
```

**`app/globals.css`** — add Chinese font override (after the existing `[lang="fa"]` block):

```css
[lang="zh"] {
  --font-sans: var(--font-sans-zh), "PingFang SC", "Microsoft YaHei", sans-serif;
}
```

The serif and mono fonts don't need overrides — Source Serif 4 and Source Code Pro work fine for the Latin characters that appear in code/technical contexts.

### 4. Create PWA manifests

**`public/manifest.zh.json`**:
```json
{
  "name": "Abzar — 200+ 免费浏览器工具",
  "short_name": "Abzar",
  "description": "200+ 免费浏览器工具。无需注册，无需服务器，一切在浏览器中运行。",
  "lang": "zh",
  "dir": "ltr",
  "start_url": "/zh",
  "scope": "/",
  "id": "/zh",
  "display": "standalone",
  "categories": ["utilities", "developer", "productivity"],
  "icons": [
    { "src": "/android-chrome-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/android-chrome-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ],
  "theme_color": "#f59e0b",
  "background_color": "#ffffff"
}
```

**`public/manifest.es.json`**:
```json
{
  "name": "Abzar — Más de 200 herramientas gratuitas para el navegador",
  "short_name": "Abzar",
  "description": "Más de 200 herramientas gratuitas en el navegador. Sin registro, sin servidor, todo funciona en tu navegador.",
  "lang": "es",
  "dir": "ltr",
  "start_url": "/es",
  "scope": "/",
  "id": "/es",
  "display": "standalone",
  "categories": ["utilities", "developer", "productivity"],
  "icons": [
    { "src": "/android-chrome-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/android-chrome-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ],
  "theme_color": "#f59e0b",
  "background_color": "#ffffff"
}
```

### 5. Update service worker precache patterns

**`scripts/generate-sw.mjs`** — update the glob patterns to include the new locales:

```js
globPatterns: [
  "{en,fa,zh,es}/index.html",
  "{en,fa,zh,es}/tools/**/*.html",
  // ... rest unchanged
],
```

### 6. Create global message files

For each new locale, create 5 global message files. Use `messages/en/` as the template — copy and translate the values (keys stay in English).

#### `messages/zh/`

| File | Source | Notes |
|------|--------|-------|
| `common.json` | Copy from `messages/en/common.json` | Translate all values. Include all 4 locale switcher labels. |
| `home.json` | Copy from `messages/en/home.json` | Translate category/tool labels. `quickFilters` array values should be translated. |
| `categories.json` | Copy from `messages/fa/categories.json` | Translate 14 category names + descriptions. (Use `fa/` as template since it's committed; `en/` version is gitignored/generated.) |
| `tools.json` | Copy from `messages/fa/tools.json` | Translate ~200 tool names + descriptions. |
| `tool-content.json` | Copy from `messages/fa/tool-content.json` | Translate about/howTo blocks for ~19 tools. |

#### `messages/es/`

Same structure — copy from `en/` templates (or `fa/` for the generated-equivalent files), translate to Spanish.

**`common.json` reference** — here is the full key structure that must be translated:

```json
{
  "nav": {
    "searchPlaceholder": "...",
    "noResults": "...",
    "installApp": "...",
    "offline": "...",
    "expandSidebar": "...",
    "collapseSidebar": "...",
    "openNavigation": "...",
    "navigation": "...",
    "comingSoon": "...",
    "toolsHeading": "..."
  },
  "localeSwitcher": {
    "label": "...",
    "en": "English",
    "fa": "فارسی",
    "zh": "中文",
    "es": "Español"
  },
  "breadcrumbs": { "home": "..." },
  "notFound": { "message": "...", "goHome": "..." },
  "toolPage": {
    "comingSoonTitle": "...",
    "comingSoonDesc": "...",
    "aboutHeading": "...",
    "howToHeading": "...",
    "relatedHeading": "..."
  },
  "categoryPage": {
    "comingSoon": "...",
    "toolsSuffix": "...",
    "betaBadge": "...",
    "newBadge": "..."
  },
  "ui": {
    "copy": "...",
    "copied": "...",
    "copiedToClipboard": "...",
    "copyFailed": "...",
    "download": "...",
    "dropFiles": "...",
    "maxFileSize": "Max {size}MB",
    "input": "...",
    "output": "..."
  },
  "site": {
    "name": "Abzar",
    "tagline": "...",
    "subtitle": "...",
    "description": "...",
    "titleSuffix": "..."
  }
}
```

**`home.json` reference:**
```json
{
  "home": {
    "categories": "...",
    "popularTools": "...",
    "toolsSuffix": "...",
    "newBadge": "...",
    "quickFilters": ["JSON", "...", "...", "PDF", "...", "...", "UUID"]
  }
}
```

### 7. Create per-tool message files

For each new locale, create 74 per-tool translation files in `messages/{locale}/tool/`. Copy the structure from `messages/en/tool/` and translate the values.

The files are auto-loaded by `loadToolMessages()` in `i18n/request.ts` — no wiring needed. Just create the files.

**To get the full list of files:**
```bash
ls messages/en/tool/
```

**Example** — `messages/zh/tool/json-formatter.json`:
```json
{
  "jsonFormatter": {
    "format": "格式化",
    "minify": "压缩",
    "validate": "验证",
    "clear": "清除",
    "inputPlaceholder": "在此粘贴 JSON... 例如 '{\"key\": \"value\"}'",
    "outputPlaceholder": "格式化结果将在此显示",
    "validJson": "有效的 JSON！",
    "text": "文本",
    "tree": "树形"
  }
}
```

**Important:** The JSON key structure (namespace + keys) must exactly match the English version. Only values change.

### 8. Update search index

**`lib/search.ts`** — add imports and entries for the new locales:

```ts
import enTools from "@/messages/en/tools.json";
import faTools from "@/messages/fa/tools.json";
import zhTools from "@/messages/zh/tools.json";   // ← ADD
import esTools from "@/messages/es/tools.json";   // ← ADD

const toolMessages: Record<string, ToolMessages> = {
  en: (enTools as { tools: ToolMessages }).tools,
  fa: (faTools as { tools: ToolMessages }).tools,
  zh: (zhTools as { tools: ToolMessages }).tools,  // ← ADD
  es: (esTools as { tools: ToolMessages }).tools,  // ← ADD
};
```

### 9. Update JSON-LD browser requirements

**`lib/json-ld.ts`** — add entries for the new locales:

```ts
const browserRequirements: Record<string, string> = {
  en: "Requires JavaScript. Works in Chrome, Firefox, Safari, Edge.",
  fa: "نیاز به جاوااسکریپت دارد. در Chrome، Firefox، Safari و Edge کار می‌کند.",
  zh: "需要 JavaScript。支持 Chrome、Firefox、Safari、Edge。",
  es: "Requiere JavaScript. Funciona en Chrome, Firefox, Safari, Edge.",
};
```

---

## What You DON'T Need to Touch

These all work automatically once the locale is registered in `i18n/routing.ts`:

- **`generateStaticParams`** — cross-products with `routing.locales` in all route files
- **Sitemap generation** — `scripts/generate-sitemap.ts` reads from `routing.locales`
- **`i18n/request.ts`** — `loadToolMessages()` reads all files in `messages/{locale}/tool/`
- **Tool components** — already use `useTranslations`, no code changes
- **URL routing** — `localePrefix: 'always'` means `/zh/...` and `/es/...` work automatically
- **`app/[locale]/layout.tsx` `rtlLocales`** — neither `zh` nor `es` is RTL, so no change needed

---

## Recommended Order

1. **Scaffolding first** (steps 1-5, 8-9) — register locales, fonts, manifests, search, JSON-LD, SW. This is ~7 file edits and 2 new files. Run `npm run check` to verify nothing breaks.

2. **Global messages** (step 6) — create `messages/zh/` and `messages/es/` with all 5 files each. Start with `common.json` and `home.json` (small, lets you test the UI immediately). Then `categories.json`, then `tools.json` (largest — ~200 entries), then `tool-content.json`.

3. **Per-tool messages** (step 7) — 74 files per locale. These can be done incrementally — tools without a translation file will still render but with missing translation warnings in dev. Start with the most popular tools: `json-formatter`, `base64`, `color-picker`, `password-generator`, `uuid-generator`, `word-counter`, `unit-converter`, `timestamp-converter`, `hash-generator`, `qr-generator`.

---

## Verification

```bash
npm run check           # Lint + tests pass
npm run dev             # Then visit:
```

- `http://localhost:3000/zh` — Chinese homepage, correct fonts
- `http://localhost:3000/es` — Spanish homepage
- `http://localhost:3000/zh/tools/text/json-formatter` — Chinese tool page with translated UI
- `http://localhost:3000/es/tools/text/json-formatter` — Spanish tool page
- Locale switcher shows all 4 languages
- Search works in Chinese/Spanish (tool names match)
- View source: `<html lang="zh" dir="ltr">` / `<html lang="es" dir="ltr">`

```bash
npm run build           # Static export succeeds
ls out/zh/              # Chinese pages exist
ls out/es/              # Spanish pages exist
```

---

## Translation Quality Notes

- **Mandarin:** Use Simplified Chinese (简体中文, mainland standard). Technical terms (JSON, Base64, UUID, SHA-256, etc.) stay in English — they're universally understood in Chinese developer contexts.
- **Spanish:** Use neutral/international Spanish rather than a regional variant. Same rule for technical terms.
- **ICU MessageFormat:** Interpolation variables like `{count}`, `{size}`, `{name}` must be preserved exactly as-is in translations. Literal braces must be escaped: `'{'` and `'}'`.
- **`site.name`:** Keep as "Abzar" in all locales (it's a brand name).
