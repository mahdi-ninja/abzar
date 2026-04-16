# i18n Implementation Plan

## Context

Add internationalization to Abzar so users can use the site in multiple languages. Non-default locales appear in the URL (`/fa/tools/...`), while the default locale (English) has no prefix (`/tools/...`). Everything is translated: UI chrome, tool names/descriptions, categories, and long-form about/howTo content. Static export means no middleware. Build time increase is acceptable.

**URL structure (`localePrefix: 'as-needed'`):**
- `/` → English homepage (no prefix)
- `/tools/text/word-counter` → English tool page
- `/fa/` → Persian homepage
- `/fa/tools/text/word-counter` → Persian tool page

**Library:** `next-intl` v4.9+ (supports Next.js 16, App Router, static export)

**Initial locales:** English (`en`), Persian (`fa`)

**Default locale:** English (`en`) — used when the URL has no locale prefix, the browser language doesn't match any supported locale, or a translation key is missing.

---

## Architecture

```
app/
  not-found.tsx                 ← NEW: fallback 404 (plain HTML, English-only)
  [locale]/
    layout.tsx                  ← ROOT LAYOUT: <html lang/dir>, fonts, providers, shell
    page.tsx                    ← MOVED from app/page.tsx
    not-found.tsx               ← NEW: localized 404
    tools/
      [category]/
        page.tsx                ← MOVED
        [tool-slug]/
          page.tsx              ← MOVED

i18n/
  routing.ts                    ← NEW: locales + defaultLocale
  request.ts                    ← NEW: message loading config
  navigation.ts                 ← NEW: createNavigation exports (Link, useRouter, etc.)

scripts/
  generate-messages.ts          ← NEW: extracts en/ messages from registry + categories + tool-content
  generate-sitemap.ts           ← NEW: builds sitemap.xml with hreflang alternates

messages/
  en/
    common.json                 ← hand-written: nav, shared UI, 404, locale switcher
    home.json                   ← hand-written: homepage strings
    categories.json             ← GENERATED from lib/categories.ts (gitignored)
    tools.json                  ← GENERATED from lib/tools-registry.ts (gitignored)
    tool-content.json           ← GENERATED from lib/tool-content.ts (gitignored)
    tool/
      word-counter.json         ← hand-written: per-tool component strings
      json-formatter.json
      ...
  fa/
    (same structure, all files hand-translated and committed)
```

---

## Fonts

The current stack (Space Grotesk, Source Serif 4, Source Code Pro) lacks Persian/Arabic glyphs. We need fonts that cover both Latin and Arabic scripts.

**Recommended stack:**

| Role | Current (Latin) | Addition (Persian) | Notes |
|------|----------------|-------------------|-------|
| Sans (`--font-sans`) | Space Grotesk | **Vazirmatn** | Most popular Persian web font, variable weight, Google Fonts hosted |
| Serif (`--font-serif`) | Source Serif 4 | **Noto Serif** (with Arabic subset) | Google Fonts, broad script coverage |
| Mono (`--font-mono`) | Source Code Pro | **Vazir Code** | Monospace companion to Vazirmatn. Self-hosted via `npm i vazir-code-font`, imported in `globals.css`, applied via `[lang="fa"]` CSS override |

**Loading strategy:** English fonts are always loaded as a fallback. Persian fonts are declared in the layout but only **applied via CSS** when the locale is `fa` — the browser will only fetch the font files when they're referenced by an active CSS rule. In `app/[locale]/layout.tsx`:

```tsx
// Always loaded
const spaceGrotesk = Space_Grotesk({ variable: "--font-sans", subsets: ["latin"] });
const sourceSerif = Source_Serif_4({ variable: "--font-serif", subsets: ["latin"] });
const sourceCodePro = Source_Code_Pro({ variable: "--font-mono", subsets: ["latin"] });

// Persian fonts — loaded only for fa locale
const vazirmatn = Vazirmatn({ variable: "--font-sans-fa", subsets: ["arabic"] });
const notoSerif = Noto_Serif({ variable: "--font-serif-fa", subsets: ["latin", "arabic"] });

// Persian mono font — self-hosted via vazir-code-font npm package
// Import in globals.css: @import 'vazir-code-font/css/vazir-code.css';
// Then reference via CSS variable:
const vazirCodeClass = "font-[--font-mono-fa]"; // applied via CSS below
```

In `app/globals.css`, add the Vazir Code import and override:
```css
@import 'vazir-code-font/css/vazir-code.css';

[lang="fa"] { --font-mono: 'Vazir Code', var(--font-mono); }
```

In the `<html>` tag, apply font classes conditionally:
```tsx
const fontVars = locale === 'fa'
  ? `${vazirmatn.variable} ${notoSerif.variable} ${sourceCodePro.variable}`
  : `${spaceGrotesk.variable} ${sourceSerif.variable} ${sourceCodePro.variable}`;
```

In CSS, override the font-family custom properties for `[lang="fa"]`:
```css
[lang="fa"] {
  --font-sans: var(--font-sans-fa);
  --font-serif: var(--font-serif-fa);
  /* --font-mono override is in globals.css via vazir-code-font import */
}
```

---

## RTL Support

Persian is right-to-left. This requires two changes:

### 1. HTML direction attribute

In `app/[locale]/layout.tsx`, set `dir` based on locale:

```tsx
const rtlLocales = ['fa', 'ar', 'he'];
const dir = rtlLocales.includes(locale) ? 'rtl' : 'ltr';

<html lang={locale} dir={dir} className={fontVars}>
```

### 2. Convert physical CSS classes to logical properties

Tailwind v4 supports CSS logical properties out of the box. Replace all physical directional classes with their logical equivalents:

| Physical (LTR-only) | Logical (bidi-safe) | CSS property |
|---------------------|--------------------|----|
| `ml-*` | `ms-*` | `margin-inline-start` |
| `mr-*` | `me-*` | `margin-inline-end` |
| `pl-*` | `ps-*` | `padding-inline-start` |
| `pr-*` | `pe-*` | `padding-inline-end` |
| `left-*` | `start-*` | `inset-inline-start` |
| `right-*` | `end-*` | `inset-inline-end` |
| `text-left` | `text-start` | `text-align: start` |
| `text-right` | `text-end` | `text-align: end` |
| `border-l-*` | `border-s-*` | `border-inline-start` |
| `border-r-*` | `border-e-*` | `border-inline-end` |
| `rounded-l-*` | `rounded-s-*` | `border-start-start/end-radius` |
| `rounded-r-*` | `rounded-e-*` | `border-end-start/end-radius` |

**Scope:** ~100 occurrences across 47 files (layout components, UI primitives, tool components). This should be done as a standalone step before i18n wiring so it can be tested in isolation.

**Exceptions:** Some classes must stay physical (e.g., `translate-x` for animations, absolute pixel positioning in canvas tools). Review each tool component individually — pure canvas/game tools likely need no changes.

**Sidebar and Sheet:** The sidebar `border-r` becomes `border-e`. The mobile `SheetContent` in `header.tsx` should pass `side` dynamically based on direction: `side={dir === 'rtl' ? 'right' : 'left'}`. The `SheetContent` component's internal close button position (`right-3`) should be changed to `end-3`. The sheet's slide animations are transform-based (`translate-x`) and correctly tied to the physical side, so they don't need conversion.

---

## Implementation Steps

### Step 0 — Convert directional classes to logical properties

**Do this first, as a separate commit, before any i18n wiring.** This ensures RTL works correctly once we add Persian.

1. Run a find-and-replace across `components/` and `app/` using the mapping table above
2. Review each change — skip physical classes in animations and canvas tools
3. In `header.tsx`, pass `side` dynamically: `side={dir === 'rtl' ? 'right' : 'left'}` (dir comes from a context/hook wired up in Step 2)
4. In `sheet.tsx`, change close button position from `right-3` to `end-3`
5. Verify in dev that LTR layout is unchanged

### Step 1 — Install & configure next-intl

```bash
npm install next-intl vazir-code-font
```

**Compatibility note:** next-intl v4.9+ supports Next.js 16. Since this project uses `output: 'export'` (fully static), **no proxy/middleware is needed** — locale routing is handled entirely by the `[locale]` segment and `generateStaticParams`. Next.js 16.2+ also provides `next/root-params` which eliminates the need for `setRequestLocale` calls.

**`next.config.ts`** — wrap with plugin:
```ts
import createNextIntlPlugin from 'next-intl/plugin';
const withNextIntl = createNextIntlPlugin('./i18n/request.ts');
export default withNextIntl({ output: 'export', images: { unoptimized: true } });
```

**`i18n/routing.ts`**:
```ts
import { defineRouting } from 'next-intl/routing';

export const locales = ['en', 'fa'] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: 'en',
  localePrefix: 'as-needed', // English URLs have no prefix; non-default locales get /fa/...
});
```

**`i18n/request.ts`** — uses `next/root-params` (Next.js 16.2+) to access the locale without `setRequestLocale`:
```ts
import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: {
      ...(await import(`../messages/${locale}/common.json`)).default,
      ...(await import(`../messages/${locale}/home.json`)).default,
      ...(await import(`../messages/${locale}/categories.json`)).default,
      ...(await import(`../messages/${locale}/tools.json`)).default,
      ...(await import(`../messages/${locale}/tool-content.json`)).default,
    },
  };
});
```

> **Note on bundle size:** Per-tool component strings (e.g., `messages/en/tool/word-counter.json`) are NOT loaded in `request.ts`. They are loaded on-demand inside each tool component via a nested `NextIntlClientProvider`. This keeps the global bundle from growing with every tool. See Step 5.
>
> **Future optimization:** `tools.json` (~30KB) and `tool-content.json` (~40KB) are currently loaded on every page. If this becomes a performance concern, split them by category or load conditionally by inspecting the request path.

**`i18n/navigation.ts`** — single source for all navigation primitives:
```ts
import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
```

### Step 2 — Move root layout into app/[locale]/, remove app/layout.tsx

Next.js 16's i18n guide explicitly supports placing the root layout inside a dynamic `[locale]` segment: `app/[locale]/layout.tsx`. This means `<html lang>` and `dir` are **baked into the static HTML** at build time — no runtime script hack needed. Delete the existing `app/layout.tsx`; the locale layout becomes the root.

**`app/[locale]/layout.tsx`** — root layout with locale-aware `<html>`:
```tsx
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Space_Grotesk, Source_Serif_4, Source_Code_Pro } from "next/font/google";
import { Vazirmatn, Noto_Serif } from "next/font/google";
import { routing } from '@/i18n/routing';
import { ThemeProvider } from "@/components/theme-provider";
import { PwaProvider } from "@/components/pwa-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { AppShell } from "@/components/layout/app-shell";
import { siteConfig } from "@/lib/config";
import "@/app/globals.css";

// English fonts (always loaded)
const spaceGrotesk = Space_Grotesk({ variable: "--font-sans", subsets: ["latin"] });
const sourceSerif = Source_Serif_4({ variable: "--font-serif", subsets: ["latin"] });
const sourceCodePro = Source_Code_Pro({ variable: "--font-mono", subsets: ["latin"] });

// Persian fonts (applied via CSS only when locale is fa)
const vazirmatn = Vazirmatn({ variable: "--font-sans-fa", subsets: ["arabic"] });
const notoSerif = Noto_Serif({ variable: "--font-serif-fa", subsets: ["latin", "arabic"] });
// Persian mono: Vazir Code is self-hosted via globals.css (@import 'vazir-code-font/css/vazir-code.css')

const rtlLocales = ['fa', 'ar', 'he'];

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return {
    metadataBase: new URL(siteConfig.url),
    // tagline stays English for now; localize in a follow-up
    title: { default: `${siteConfig.name} — ${siteConfig.tagline}`, template: `%s — ${siteConfig.name}` },
    description: siteConfig.description,
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map(l => [l, l === routing.defaultLocale ? '/' : `/${l}`])
      ),
    },
  };
}

export default async function RootLayout({
  children, params
}: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const messages = await getMessages();
  const dir = rtlLocales.includes(locale) ? 'rtl' : 'ltr';
  const fontVars = locale === 'fa'
    ? `${vazirmatn.variable} ${notoSerif.variable} ${sourceCodePro.variable}`
    : `${spaceGrotesk.variable} ${sourceSerif.variable} ${sourceCodePro.variable}`;

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning
      className={`${fontVars} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: `/* theme init script */` }} />
      </head>
      <body className="min-h-full">
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <PwaProvider>
              <TooltipProvider>
                <AppShell>{children}</AppShell>
                <Toaster />
              </TooltipProvider>
            </PwaProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

> **Key difference from original plan:** No `app/layout.tsx` at all. `app/[locale]/layout.tsx` IS the root layout. Next.js 16 supports this pattern for i18n — see `node_modules/next/dist/docs/01-app/02-guides/internationalization.md`. The `<html lang="fa" dir="rtl">` is baked into the static HTML for Persian pages, which is correct for SEO and accessibility.

Move page files:
- `app/layout.tsx` → DELETE (replaced by `app/[locale]/layout.tsx`)
- `app/page.tsx` → `app/[locale]/page.tsx`
- `app/tools/[category]/page.tsx` → `app/[locale]/tools/[category]/page.tsx`
- `app/tools/[category]/[tool-slug]/page.tsx` → `app/[locale]/tools/[category]/[tool-slug]/page.tsx`
- `app/globals.css` → stays at `app/globals.css` (imported by locale layout)

> **No redirect page needed.** With `localePrefix: 'as-needed'`, visiting `/` directly serves the English homepage. No spinner, no client-side redirect, no blank flash. Non-default locales are accessed via their prefix (`/fa/`).

**Create `app/not-found.tsx`** — fallback 404 for requests that don't match any locale segment. English-only, self-contained (no providers or theme):
```tsx
export default function RootNotFound() {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>404</h1>
          <p style={{ marginTop: '0.5rem', color: '#666' }}>Page not found</p>
          <a href="/" style={{ marginTop: '1rem', display: 'inline-block', color: '#d97706' }}>Go home</a>
        </div>
      </body>
    </html>
  );
}
```

**Create `app/[locale]/not-found.tsx`** — localized 404 (rendered inside the locale layout, so providers are available):
```tsx
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function NotFound() {
  const t = useTranslations('notFound');
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="mt-2 text-muted-foreground">{t('message')}</p>
        <Link href="/" className="mt-4 inline-block text-primary underline">
          {t('goHome')}
        </Link>
      </div>
    </div>
  );
}
```

Update `generateStaticParams` in nested routes to cross-product with locales. Since `setRequestLocale` is **not needed** with Next.js 16.2+ root params, omit it from all pages:
```ts
// app/[locale]/tools/[category]/[tool-slug]/page.tsx
export function generateStaticParams() {
  return routing.locales.flatMap(locale =>
    tools.map(t => ({ locale, category: t.category, 'tool-slug': t.slug }))
  );
}
```

### Step 3 — Create message files

Create the hand-written message files (`common.json`, `home.json`, per-tool component files). The three generated files (`tools.json`, `categories.json`, `tool-content.json`) are produced by `scripts/generate-messages.ts` — see the "Name/Description Source of Truth" section for details.

Persian files (`messages/fa/`) have identical keys with translated values. All `fa/` files are hand-translated and committed (including the ones that correspond to generated `en/` files).

**`messages/en/common.json`** — shared UI strings (hand-written):
```json
{
  "nav": {
    "searchPlaceholder": "Search tools...",
    "noResults": "No tools found.",
    "installApp": "Install Abzar",
    "offline": "Offline",
    "expandSidebar": "Expand sidebar",
    "collapseSidebar": "Collapse sidebar",
    "openNavigation": "Open navigation",
    "navigation": "Navigation"
  },
  "localeSwitcher": {
    "label": "Language",
    "en": "English",
    "fa": "فارسی"
  },
  "breadcrumbs": {
    "home": "Home"
  },
  "notFound": {
    "message": "Page not found",
    "goHome": "Go home"
  },
  "toolPage": {
    "comingSoonTitle": "Coming Soon",
    "comingSoonDesc": "This tool is currently under development.",
    "aboutHeading": "About this tool",
    "howToHeading": "How to use",
    "relatedHeading": "Related Tools"
  },
  "categoryPage": {
    "comingSoon": "Coming Soon",
    "toolsSuffix": "Tools",
    "betaBadge": "Beta",
    "newBadge": "New"
  }
}
```

**`messages/en/home.json`** — homepage (hand-written):
```json
{
  "home": {
    "categories": "Categories",
    "popularTools": "Popular Tools",
    "toolsSuffix": "tools",
    "newBadge": "New"
  }
}
```

**`messages/en/categories.json`** — GENERATED by `scripts/generate-messages.ts` from `lib/categories.ts` (gitignored):
```json
{
  "categories": {
    "text": { "name": "Text & Language", "description": "Transform, analyze, and generate text" },
    "developer": { "name": "Developer Tools", "description": "Format, encode, decode, and debug" }
  }
}
```

**`messages/en/tools.json`** — GENERATED by `scripts/generate-messages.ts` from `lib/tools-registry.ts` (gitignored):
```json
{
  "tools": {
    "word-counter": { "name": "Word & Character Counter", "description": "Count words, characters, sentences, paragraphs with readability scores" },
    "json-formatter": { "name": "JSON Formatter", "description": "..." }
  }
}
```

**`messages/en/tool-content.json`** — GENERATED by `scripts/generate-messages.ts` from `lib/tool-content.ts` (gitignored):
```json
{
  "toolContent": {
    "word-counter": {
      "about": "...",
      "howTo": ["Step 1", "Step 2", "Step 3"]
    }
  }
}
```

**`messages/en/tool/word-counter.json`** — per-tool component strings (hand-written):
```json
{
  "wordCounter": {
    "clear": "Clear",
    "placeholder": "Type or paste your text here...",
    "words": "Words",
    "characters": "Characters"
  }
}
```

> **Generated vs hand-written:** `categories.json`, `tools.json`, and `tool-content.json` in `messages/en/` are generated by `scripts/generate-messages.ts` and gitignored. All other `en/` files (`common.json`, `home.json`, `tool/*.json`) are hand-written and committed. All `fa/` files are hand-translated and committed.

### Step 4 — Replace hardcoded strings in shared components

Use `useTranslations()` in client components and `getTranslations()` in server components.

**Replace all `next/link` and `next/navigation` imports** with the `@/i18n/navigation` equivalents:

```ts
// Before
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

// After
import { Link, useRouter, usePathname } from '@/i18n/navigation';
```

Files to update:

| File | Changes |
|------|---------|
| `components/layout/header.tsx` | `Link`, `useRouter` from `@/i18n/navigation`. Translate search placeholder, "No tools found.", "Offline", "Install Abzar", "Coming Soon". Add locale switcher button. |
| `components/layout/sidebar.tsx` | `Link`, `usePathname` from `@/i18n/navigation`. Category names from `t('categories.{slug}.name')`. Aria labels translated. |
| `components/layout/breadcrumbs.tsx` | `Link` from `@/i18n/navigation`. "Home" from `t('breadcrumbs.home')`. Category names and tool names from translations. Hardcoded `/` separator stays (not directional). |
| `components/layout/tool-page.tsx` | `Link` from `@/i18n/navigation`. "About this tool", "How to use", "Related Tools" headings from translations. Tool names/descriptions from translations. |
| `components/layout/app-shell.tsx` | No string changes, but verify it works with new layout nesting. |
| `app/[locale]/page.tsx` | `Link` from `@/i18n/navigation`. "Categories", "Popular Tools", "{n} tools", "New" from translations. Category/tool names from translations. |
| `components/home-search.tsx` | `useRouter`, `usePathname` from `@/i18n/navigation`. Translate search placeholder and "No results" text. |
| `app/[locale]/tools/[category]/page.tsx` | `Link` from `@/i18n/navigation`. "Home", "Coming Soon", "Beta", "New" from translations. Category/tool names from translations. |
| `app/[locale]/tools/[category]/[tool-slug]/page.tsx` | Localize `generateMetadata` (see Step 4b). |

### Step 4b — Localize metadata & SEO

**Tool page `generateMetadata`:**
```ts
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string; category: string; 'tool-slug': string }> }) {
  const { locale, 'tool-slug': slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) return {};
  const t = await getTranslations({ locale, namespace: 'tools' });
  const toolName = t(`${slug}.name`);
  const toolDesc = t(`${slug}.description`);
  return {
    title: `${toolName} — ${siteConfig.titleSuffix}`,
    description: toolDesc,
    openGraph: {
      title: `${toolName} — ${siteConfig.titleSuffix} | ${siteConfig.name}`,
      description: toolDesc,
      images: [`/og/${tool.category}/${tool.slug}.png`],
    },
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map(l => [l,
          l === routing.defaultLocale
            ? `/tools/${tool.category}/${tool.slug}`
            : `/${l}/tools/${tool.category}/${tool.slug}`
        ])
      ),
    },
    other: {
      "script:ld+json": JSON.stringify(generateToolJsonLd(tool, { name: toolName, description: toolDesc })),
    },
  };
}
```

**Category page `generateMetadata`:** Same pattern — use `getTranslations({ locale, namespace: 'categories' })`.

**`hreflang` alternates:** Added via `alternates.languages` in each `generateMetadata`. This produces `<link rel="alternate" hreflang="en" href="...">` tags automatically.

**JSON-LD:** Update `generateToolJsonLd` to accept an optional `overrides` param for translated name/description. Signature becomes:
```ts
function generateToolJsonLd(tool: Tool, overrides?: { name: string; description: string })
```

**OG images:** Keep as English-only for now. Localizing OG images requires a generation pipeline change — track as a follow-up.

### Step 5 — Replace strings in tool components

Each tool component gets translations loaded on-demand to keep bundle size small.

**Pattern for tool component strings:**
```tsx
// components/tools/word-counter/index.tsx
import { useTranslations } from 'next-intl';

export default function WordCounter() {
  const t = useTranslations('wordCounter');
  return <textarea placeholder={t('placeholder')} />;
}
```

**Loading per-tool messages:** The per-tool JSON files (`messages/{locale}/tool/word-counter.json`) are **merged with** the page's existing messages, not replaced. This is critical — a nested `NextIntlClientProvider` with only tool messages would shadow the parent provider, causing `t('nav.searchPlaceholder')` or other shared keys to fail inside the tool component.

The solution: use `getMessages()` to get the already-loaded global messages, merge the per-tool messages in, and pass the combined object to the provider:

```tsx
// app/[locale]/tools/[category]/[tool-slug]/page.tsx
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

// Inside the component:
const globalMessages = await getMessages();

let toolMessages = {};
try {
  toolMessages = (await import(`@/messages/${locale}/tool/${slug}.json`)).default;
} catch {
  // No translation file for this tool yet — fall back to English
  try {
    toolMessages = (await import(`@/messages/en/tool/${slug}.json`)).default;
  } catch {
    // Tool has no translatable strings (e.g., pure canvas tools)
  }
}

// Merge: global messages + tool-specific messages
const mergedMessages = { ...globalMessages, ...toolMessages };

return (
  <NextIntlClientProvider messages={mergedMessages}>
    <ToolPage tool={tool} about={...} howTo={...}>
      <ToolComponent />
    </ToolPage>
  </NextIntlClientProvider>
);
```

> **Why merge instead of nest?** A nested `NextIntlClientProvider` **replaces** the parent's messages — it does not inherit them. If a tool component (or any child like `CopyButton`, `DownloadButton`) calls `useTranslations('nav')`, it would fail with a missing key error. Merging keeps all global keys available while adding the tool-specific ones. The only cost is that tool pages send the full message set to the client, but since global messages are ~35KB (already loaded by the parent provider), this adds no extra transfer — just a re-declaration in the provider props.

This way, `wordCounter.*` keys are only loaded when the user visits the word counter page. Tools without a translation file still work — they just won't have translated component strings.

**Incremental approach:** Do this one tool at a time. Tools with no user-facing strings (pure canvas tools like `pixel-art`, `game-of-life`) need no translation file at all.

### Step 6 — Locale switcher component

Add a `LocaleSwitcher` dropdown to the header. Uses a `Select` from the start so it scales to any number of locales without rework:

```tsx
'use client';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { Select, SelectTrigger, SelectItem, SelectPopover } from '@/components/ui/select';

export function LocaleSwitcher() {
  const locale = useLocale();
  const t = useTranslations('localeSwitcher');
  const pathname = usePathname();
  const router = useRouter();

  function onChange(next: string | null) {
    if (!next) return;
    router.replace(pathname, { locale: next as Locale });
  }

  return (
    <Select value={locale} onValueChange={onChange}>
      <SelectTrigger
        className="h-8 w-auto gap-1 rounded-md px-2 text-sm font-medium"
        aria-label={t('label')}
      >
        <span>{t(locale)}</span>
      </SelectTrigger>
      <SelectPopover>
        {routing.locales.map((l) => (
          <SelectItem key={l} value={l}>
            {t(l)}
          </SelectItem>
        ))}
      </SelectPopover>
    </Select>
  );
}
```

Labels come from `common.json`'s `localeSwitcher` namespace (e.g., `"en": "English"`, `"fa": "فارسی"`), so adding a language means adding one key to each locale's `common.json` — no code changes.

Place it in `Header` next to `ThemeToggle`.

### Step 7 — Internal link updates

All `href="/tools/..."` links must go through `@/i18n/navigation`'s `Link`, which auto-prefixes the current locale.

Files to update:
- `components/layout/sidebar.tsx` — category links
- `components/layout/breadcrumbs.tsx` — home + category links
- `components/layout/header.tsx` — logo link, search result navigation
- `components/layout/tool-page.tsx` — related tool links
- `components/home-search.tsx` — search result links, router navigation
- `app/[locale]/page.tsx` — category + tool links
- `app/[locale]/tools/[category]/page.tsx` — tool links, home breadcrumb

The `usePathname` from `@/i18n/navigation` returns the path **without** the locale prefix, so existing `pathname.startsWith('/tools/...')` checks in sidebar still work.

### Step 8 — Add Persian translation files

1. Run `scripts/generate-messages.ts` to ensure `messages/en/` generated files are up to date
2. Copy all `messages/en/` files → `messages/fa/` (both generated and hand-written sources serve as the template)
3. Machine-translate all values (keys stay in English)
4. Human review of category names, tool names, and UI chrome
5. Tool component strings (`tool/*.json`) can be translated incrementally
6. Commit all `fa/` files — unlike `en/`, nothing in `fa/` is gitignored

---

## Message Bundle Size Strategy

With 200+ tools, a single JSON file would be ~100-150KB. The split structure avoids this:

| File | Loaded when | Estimated size |
|------|-------------|---------------|
| `common.json` | Every page | ~3KB |
| `home.json` | Homepage only | ~1KB |
| `categories.json` | Homepage + category pages | ~3KB (generated for `en/`) |
| `tools.json` | Homepage + category pages (tool names) | ~30KB (generated for `en/`) |
| `tool-content.json` | Tool pages (about/howTo) | ~40KB (generated for `en/`) |
| `tool/{slug}.json` | Individual tool page only | ~0.5KB each |

**Future optimization:** If `tools.json` grows too large, split it by category (`tools-text.json`, `tools-developer.json`, etc.) and load only what the current page needs in `request.ts` by inspecting the URL path.

The per-tool component files (`tool/{slug}.json`) are loaded via a nested `NextIntlClientProvider` on the tool page, so they are code-split automatically.

---

## PWA Manifest Options

The current `site.webmanifest` contains English-only `name` and `description`. Options:

### Option A — Locale-specific manifests (recommended)

Generate `public/manifest.en.json` and `public/manifest.fa.json` at build time. In `app/[locale]/layout.tsx`, set the manifest link dynamically:

```tsx
export async function generateMetadata({ params }) {
  const { locale } = await params;
  return { manifest: `/manifest.${locale}.json` };
}
```

Each manifest has translated `name`, `short_name`, `description`, and an adjusted `start_url` (`/` for English, `/fa` for Persian). `dir` and `lang` fields are set accordingly:

```json
{
  "name": "ابزار — ۲۰۰+ ابزار رایگان مرورگر",
  "short_name": "ابزار",
  "lang": "fa",
  "dir": "rtl",
  "start_url": "/fa",
  ...
}
```

### Option B — Single manifest, no translation

Keep one `site.webmanifest` with English strings. Simpler, but the installed PWA always shows English name regardless of user language.

**Recommendation:** Go with Option A. The manifests can be generated from the message files at build time with a small script.

---

## Sitemap

The current `public/sitemap.xml` is a static file (~1300 lines) with English-only URLs. It needs to include all locale variants with `xhtml:link` alternates for proper multi-language SEO.

### Approach — Build-time generation script

Add a `scripts/generate-sitemap.ts` script that runs as part of `npm run build`. It reads from `routing.locales` and the tools registry to produce a single `sitemap.xml` with `hreflang` annotations:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>https://abzar.tools</loc>
    <xhtml:link rel="alternate" hreflang="en" href="https://abzar.tools" />
    <xhtml:link rel="alternate" hreflang="fa" href="https://abzar.tools/fa" />
    <xhtml:link rel="alternate" hreflang="x-default" href="https://abzar.tools" />
    <lastmod>2026-04-16</lastmod>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://abzar.tools/fa</loc>
    <xhtml:link rel="alternate" hreflang="en" href="https://abzar.tools" />
    <xhtml:link rel="alternate" hreflang="fa" href="https://abzar.tools/fa" />
    <xhtml:link rel="alternate" hreflang="x-default" href="https://abzar.tools" />
    <lastmod>2026-04-16</lastmod>
    <priority>1.0</priority>
  </url>
  <!-- Same pattern for every tool and category page -->
</urlset>
```

Key rules:
- Every URL that exists in multiple locales gets `xhtml:link` entries for **all** its locale variants (including itself)
- `hreflang="x-default"` points to the English (default locale) version
- English URLs have no prefix; non-default locale URLs have `/{locale}/` prefix
- Only `live`, `featured`, and `beta` tools are included (same as current)

The sitemap script runs as part of `prebuild` (see "Name/Description Source of Truth" section for the full `package.json` scripts). It writes to `public/sitemap.xml` (overwriting the static file), so Next.js copies it to `out/` during build. Delete the current hand-maintained `public/sitemap.xml` and replace it with this generated approach.

---

## Critical Files

| File | Change |
|---|---|
| `next.config.ts` | Add next-intl plugin |
| `i18n/routing.ts` | NEW: locale definitions |
| `i18n/request.ts` | NEW: message loading (no setRequestLocale needed) |
| `i18n/navigation.ts` | NEW: Link, useRouter, usePathname exports |
| `app/layout.tsx` | DELETE: replaced by `app/[locale]/layout.tsx` |
| `app/not-found.tsx` | NEW: root 404 fallback (English-only, inline styles) |
| `app/[locale]/layout.tsx` | NEW: root layout with `<html lang dir>`, fonts, IntlProvider, providers |
| `app/[locale]/page.tsx` | MOVED + useTranslations |
| `app/[locale]/not-found.tsx` | NEW: localized 404 |
| `app/[locale]/tools/[category]/page.tsx` | MOVED + locale in generateStaticParams + translations |
| `app/[locale]/tools/[category]/[tool-slug]/page.tsx` | MOVED + locale in generateStaticParams + localized metadata + merged IntlProvider for tool strings (global + per-tool messages, with try/catch fallback) |
| `scripts/generate-messages.ts` | NEW: extracts `tools.json`, `categories.json`, `tool-content.json` from registry/categories/tool-content into `messages/en/` |
| `messages/en/common.json`, `home.json`, `tool/*.json` | NEW: hand-written English UI strings (committed) |
| `messages/en/tools.json`, `categories.json`, `tool-content.json` | GENERATED by build script (gitignored) |
| `messages/fa/*.json` | NEW: hand-translated Persian strings (all committed) |
| `lib/categories.ts` | No changes — keeps `name`/`description` as canonical English source. Components resolve display text via `t('categories.{slug}.name')` |
| `lib/tools-registry.ts` | No changes — keeps `name`/`description` as canonical English source and Fuse.js search index. Display text in UI comes from messages |
| `lib/tool-content.ts` | No changes — keeps `about`/`howTo` as canonical English source. Extracted to messages by build script |
| `lib/search.ts` | No changes — Fuse.js index stays English-only, built from registry |
| `lib/json-ld.ts` | Accept translated name/description overrides |
| `scripts/generate-sitemap.ts` | NEW: build-time sitemap generator with hreflang alternates |
| `public/sitemap.xml` | DELETE static file (now generated by build script) |
| `components/layout/header.tsx` | `@/i18n/navigation`, useTranslations, add LocaleSwitcher, dynamic Sheet side |
| `components/layout/sidebar.tsx` | `@/i18n/navigation`, useTranslations, usePathname |
| `components/layout/breadcrumbs.tsx` | `@/i18n/navigation`, useTranslations for "Home" + category names |
| `components/layout/tool-page.tsx` | `@/i18n/navigation`, useTranslations for headings + tool content |
| `components/home-search.tsx` | `@/i18n/navigation`, useTranslations for search placeholder + "No results" |
| `components/ui/sheet.tsx` | Close button `right-3` → `end-3` |
| `components/ui/*.tsx` | Directional classes → logical properties |
| `components/tools/*/index.tsx` | useTranslations per tool (incremental) |

---

## Verification

```bash
npm run dev
# Check: http://localhost:3000 → English homepage directly (no redirect)
# Check: http://localhost:3000/tools/text/word-counter → English tool page (no /en prefix)
# Check: http://localhost:3000/fa → Persian homepage, RTL
# Check: http://localhost:3000/fa/tools/text/word-counter → Persian tool page
# Check: switching locale adds/removes prefix and stays on same page

npm run build
# Verify: out/index.html is the English homepage
# Verify: out/tools/... exist (English, no prefix)
# Verify: out/fa/tools/... exist (Persian, with prefix)
# Verify: out/sitemap.xml contains hreflang alternates for all locales
# Verify: out/manifest.en.json and out/manifest.fa.json exist

npm run check
# All lint + tests pass
```

Manual checks:
- [ ] Locale switcher in header changes language and stays on same page
- [ ] RTL layout: sidebar on right, text aligned right, margins/paddings mirrored
- [ ] Persian fonts render correctly (no tofu/boxes)
- [ ] Tool page about/howTo renders in correct language
- [ ] Breadcrumbs show translated "Home" and category names
- [ ] `<html lang="fa" dir="rtl">` is set correctly
- [ ] `<link rel="alternate" hreflang="...">` tags present in page source
- [ ] JSON-LD contains translated tool name/description
- [ ] 404 page shows translated message
- [ ] PWA install prompt still works
- [ ] Theme toggle still works
- [ ] localStorage keys unchanged (prefixed with `abzar:`)
- [ ] Search works in English; Persian search index is a follow-up (search is English-only for now)
- [ ] `sitemap.xml` contains `xhtml:link` alternates for every URL, including `x-default`
- [ ] View source of `/fa/...` page — `<html lang="fa" dir="rtl">` is in the static HTML (not set by JS)

---

## Adding a New Language

Adding a new language should require touching exactly 3 places + translations:

### 1. Register the locale

**`i18n/routing.ts`** — add to the `locales` array:
```ts
export const locales = ['en', 'fa', 'de'] as const;
```

That's it. `generateStaticParams` and navigation all read from this array automatically. The new locale will get a URL prefix (`/de/...`); only the default locale (`en`) has no prefix.

### 2. Add the locale label

**`messages/en/common.json`** (and all other locale files) — add to the `localeSwitcher` namespace:
```json
{
  "localeSwitcher": {
    "en": "English",
    "fa": "فارسی",
    "de": "Deutsch"
  }
}
```

If the locale is RTL, add it to the `rtlLocales` array in `app/[locale]/layout.tsx`.

### 3. Create message files

```bash
# Ensure generated en/ files are fresh
npm run prebuild
# Copy all en/ files as template (generated + hand-written)
cp -r messages/en messages/de
```

Then translate all values in `messages/de/*.json`. Keys stay in English. All `de/` files are committed (unlike `en/`, where `tools.json`, `categories.json`, and `tool-content.json` are generated and gitignored).

### 4. (If needed) Add fonts

If the new language uses a script not covered by existing fonts (e.g., CJK, Devanagari), add the appropriate Google Font in `app/[locale]/layout.tsx` and add a CSS override for the new `lang` attribute.

### 5. (If needed) Add PWA manifest

If using Option A for manifests, create `public/manifest.de.json` (or automate via the build script).

### Checklist for new language

- [ ] Added to `i18n/routing.ts` `locales` array
- [ ] Label added to `localeSwitcher` in all `common.json` files
- [ ] `messages/{locale}/` directory created with all JSON files translated
- [ ] If RTL: added to `rtlLocales` in `app/[locale]/layout.tsx`
- [ ] If new script: font added and CSS override created
- [ ] If using per-locale manifests: manifest file created
- [ ] `npm run build` succeeds — static pages generated for new locale
- [ ] `npm run check` passes

---

## Name/Description Source of Truth & Search

**Decision: Registry is the single source of truth for English. Message files are generated.**

`tools-registry.ts`, `categories.ts`, and `tool-content.ts` keep their English `name`/`description` fields unchanged. A build-time script (`scripts/generate-messages.ts`) extracts these into `messages/en/tools.json`, `messages/en/categories.json`, and `messages/en/tool-content.json`. Only non-default locale directories (e.g., `messages/fa/`) are hand-translated and committed.

```
tools-registry.ts  ─┐
categories.ts       ─┼── scripts/generate-messages.ts ──▶  messages/en/tools.json        (generated, gitignored)
tool-content.ts     ─┘                                     messages/en/categories.json    (generated, gitignored)
                                                            messages/en/tool-content.json  (generated, gitignored)

messages/en/common.json         (hand-written, committed)
messages/en/home.json           (hand-written, committed)
messages/en/tool/*.json         (hand-written, committed)

messages/fa/*                   (hand-translated, committed — all files)
```

**Adding a tool** still touches exactly 3 places (registry, component, dynamic import). The build script regenerates the English message files automatically — no manual sync needed.

**Search stays English-only for now.** Fuse.js index is built from the registry's `name`/`description`/`tags` — no change to `lib/search.ts`. The search bar appears in all locales but always matches English terms. Localized search (building a per-locale Fuse index from message files) is a follow-up.

**`.gitignore`** — add the generated files:
```
messages/en/tools.json
messages/en/categories.json
messages/en/tool-content.json
```

**`scripts/generate-messages.ts`** — extracts display strings from source modules:
```ts
import { tools } from '../lib/tools-registry';
import { categories } from '../lib/categories';
import { toolContent } from '../lib/tool-content';
import { writeFileSync, mkdirSync } from 'fs';

mkdirSync('messages/en', { recursive: true });

// tools.json
const toolsMessages: Record<string, { name: string; description: string }> = {};
for (const t of tools) {
  toolsMessages[t.slug] = { name: t.name, description: t.description };
}
writeFileSync('messages/en/tools.json', JSON.stringify({ tools: toolsMessages }, null, 2));

// categories.json
const catMessages: Record<string, { name: string; description: string }> = {};
for (const c of categories) {
  catMessages[c.slug] = { name: c.name, description: c.description };
}
writeFileSync('messages/en/categories.json', JSON.stringify({ categories: catMessages }, null, 2));

// tool-content.json
const contentMessages: Record<string, { about: string; howTo: string[] }> = {};
for (const [slug, content] of Object.entries(toolContent)) {
  contentMessages[slug] = { about: content.about, howTo: content.howTo };
}
writeFileSync('messages/en/tool-content.json', JSON.stringify({ toolContent: contentMessages }, null, 2));
```

**`package.json`** — run generation before build and dev:
```json
"prebuild": "tsx scripts/generate-messages.ts && tsx scripts/generate-sitemap.ts",
"predev": "tsx scripts/generate-messages.ts"
```

---

## Out of Scope (follow-ups)

- **Localized search** — Fuse.js index is built from the registry (English). To support searching in Persian, build a per-locale Fuse index from the active locale's message files at runtime. The search bar still appears in all locales but only matches English terms until this is implemented.
- **Localized OG images** — requires updating the satori pipeline to render translated text.
- **Localized site tagline** — `siteConfig.tagline` stays English for now. When localized, move to messages and use `getTranslations` in `generateMetadata`.
- **Pluralization** — next-intl supports ICU message format (`{count, plural, one {# tool} other {# tools}}`). Add when needed.
- **Date/number formatting** — use `useFormatter()` from next-intl when date/number display is added to tools.
- **Auto-detect locale** — with `localePrefix: 'as-needed'`, visiting `/` always serves English. Auto-detecting browser language and redirecting to `/fa/` could be added as a client-side check on the homepage, but is not included in this plan. Users switch via the locale switcher instead.
- **`tools.json` / `tool-content.json` bundle optimization** — currently loaded on every page (~70KB combined). Can be split by category or loaded conditionally when performance data warrants it.
