# Abzar — Client-Side Web Tools

> **Abzar** (ابزار) means "tools" in Persian. This project is a comprehensive collection of browser-only utility tools — no backend, no server, no database. Everything runs 100% client-side.

> **Purpose**: This document is the complete specification for building Abzar. It covers architecture, modular loading strategy, every tool spec, and implementation guidelines.

---

## Table of Contents

1. [Architecture & Tech Stack](#architecture--tech-stack)
2. [Modular Loading Strategy](#modular-loading-strategy)
3. [Folder Structure](#folder-structure)
4. [Tool Registry](#tool-registry)
5. [Shared Tool Shell](#shared-tool-shell)
6. [Shared UI Primitives](#shared-ui-primitives)
7. [Shared UX Patterns](#shared-ux-patterns)
8. [Categories & Tools](#categories--tools)
9. [Implementation Priority](#implementation-priority)
10. [SEO & Discoverability](#seo--discoverability)
11. [Performance Budgets](#performance-budgets)
12. [Notes for Claude Code](#notes-for-claude-code)

---

## Architecture & Tech Stack

| Concern | Choice | Why |
|---------|--------|-----|
| Framework | Next.js 14+ (App Router) | File-based routing gives automatic route-level code splitting. Each tool is its own route and its own JS chunk. |
| Language | TypeScript | Type safety across 200+ tool components. |
| Styling | Tailwind CSS | Utility-first keeps styles co-located with components. Purge removes unused classes in production. |
| State | React hooks + `localStorage` | No global state library needed. Each tool manages its own state. Persistence via a shared `useLocalStorage` hook. |
| Deployment | Static export (`next build && next export`) | Host on Vercel, Netlify, Cloudflare Pages, or GitHub Pages. Zero server cost. |
| Backend | None | Zero server-side logic. Zero API calls. Optional: bundled static JSON files for reference data (currency rates, port numbers, OUI database). |

---

## Modular Loading Strategy

This is the most critical architectural decision. Abzar has ~200 tools, some with heavy dependencies. The user must never pay the cost of tools they aren't using.

### Principle 1: Route-Level Code Splitting (automatic)

Next.js App Router splits every `page.tsx` into its own chunk. A user visiting `/tools/developer/json-formatter` never downloads the PDF merger, the audio trimmer, or any other tool's code. This happens automatically as long as you follow one rule:

> **Never import tool components into shared layouts, the homepage, or the registry.**

The homepage shows tool cards from the registry (metadata only). The sidebar shows category lists from the registry. Neither imports any actual tool code.

### Principle 2: Lazy-Load Heavy Libraries on User Action

Some tools require large third-party libraries. These must not load on page visit — they load when the user takes an action (drops a file, clicks "Generate", etc.).

**Weight classes and loading strategy:**

| Weight Class | Examples | Strategy |
|-------------|----------|----------|
| **Light** (<20KB) | String manipulation, math, date formatting | Import normally. These are trivially small. |
| **Medium** (20–100KB) | `marked`, `js-yaml`, `PapaParse`, `highlight.js`, `qrcode` | Dynamic `import()` at component level. Load on mount is fine. |
| **Heavy** (100KB–1MB) | `pdf-lib` (~300KB), `mathjs` (~170KB), `sql-formatter`, `JSZip` | Dynamic `import()` triggered by user action, not on mount. Show a lightweight shell first. |
| **Massive** (>1MB) | `ffmpeg.wasm` (~25MB), `tesseract.js` | Load on explicit user opt-in with a progress indicator. Consider a "Loading engine..." state. |

**Implementation pattern for heavy libraries:**

```tsx
// components/tools/pdf-merger/index.tsx
'use client';
import { useState } from 'react';

export default function PdfMerger() {
  const [pdfLib, setPdfLib] = useState<typeof import('pdf-lib') | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileDrop = async (files: File[]) => {
    if (!pdfLib) {
      setLoading(true);
      const lib = await import('pdf-lib');  // Only loads here
      setPdfLib(lib);
      setLoading(false);
    }
    // Now use pdfLib to merge...
  };

  return (
    <FileDropZone onDrop={handleFileDrop}>
      {loading ? <LoadingSpinner label="Loading PDF engine..." /> : 'Drop PDF files here'}
    </FileDropZone>
  );
}
```

### Principle 3: Dynamic Component Import at the Route Level

Each tool's `page.tsx` should use `next/dynamic` to import the tool component. This ensures the tool's code (and its dependencies) are in a separate chunk from the page shell:

```tsx
// app/tools/developer/json-formatter/page.tsx
import dynamic from 'next/dynamic';
import { ToolPage } from '@/components/layout/tool-page';
import { getToolBySlug } from '@/lib/tools-registry';

const JsonFormatter = dynamic(
  () => import('@/components/tools/json-formatter'),
  { loading: () => <ToolSkeleton /> }
);

export default function Page() {
  const tool = getToolBySlug('json-formatter');
  return (
    <ToolPage tool={tool}>
      <JsonFormatter />
    </ToolPage>
  );
}

// Generate static metadata for SEO
export function generateMetadata() {
  const tool = getToolBySlug('json-formatter');
  return {
    title: `${tool.name} — Abzar`,
    description: tool.description,
  };
}
```

### Principle 4: No Barrel Files for Tools

Never create an `index.ts` that re-exports all tool components:

```tsx
// ❌ NEVER DO THIS — defeats code splitting
export { JsonFormatter } from './json-formatter';
export { PdfMerger } from './pdf-merger';
export { ImageResizer } from './image-resizer';

// ✅ CORRECT — each tool is imported individually at its route
import('@/components/tools/json-formatter')
```

### Principle 5: Keep the Registry Pure Metadata

The registry file must never import tool components. It's just data:

```tsx
// ✅ CORRECT — registry is pure data, <5KB
export const tools: Tool[] = [
  { slug: 'json-formatter', name: 'JSON Formatter', category: 'developer', ... },
  { slug: 'pdf-merger', name: 'PDF Merger', category: 'files', ... },
];

// ❌ WRONG — importing components makes the registry pull in all tool code
import { JsonFormatter } from '@/components/tools/json-formatter';
export const tools = [
  { slug: 'json-formatter', component: JsonFormatter, ... },
];
```

---

## Folder Structure

```
abzar/
├── app/
│   ├── layout.tsx                        # Root layout: sidebar + header + theme
│   ├── page.tsx                          # Homepage: search, category grid, featured tools
│   └── tools/
│       ├── layout.tsx                    # Tools layout (optional: breadcrumbs wrapper)
│       └── [category]/
│           ├── page.tsx                  # Category listing page
│           └── [tool-slug]/
│               └── page.tsx             # Tool page: metadata + ToolPage shell + dynamic import
│
├── components/
│   ├── layout/
│   │   ├── sidebar.tsx                  # Category navigation sidebar
│   │   ├── header.tsx                   # Top bar with search + theme toggle
│   │   ├── breadcrumbs.tsx              # Breadcrumb navigation
│   │   ├── tool-page.tsx               # Shared tool page shell (title, desc, about, SEO)
│   │   └── tool-skeleton.tsx           # Loading skeleton for dynamic tool imports
│   │
│   ├── ui/                             # Reusable UI primitives (see section below)
│   │   ├── copy-button.tsx
│   │   ├── download-button.tsx
│   │   ├── file-drop-zone.tsx
│   │   ├── input-output-layout.tsx
│   │   ├── tab-switcher.tsx
│   │   ├── slider.tsx
│   │   ├── toggle.tsx
│   │   ├── card.tsx
│   │   ├── loading-spinner.tsx
│   │   └── ...
│   │
│   └── tools/                          # One folder per tool — self-contained
│       ├── json-formatter/
│       │   ├── index.tsx               # The interactive tool component
│       │   └── utils.ts                # Tool-specific helpers (if needed)
│       ├── pdf-merger/
│       │   ├── index.tsx
│       │   └── utils.ts
│       └── ... (one folder per tool)
│
├── lib/
│   ├── tools-registry.ts              # Master list: metadata only, no component imports
│   ├── categories.ts                  # Category definitions (name, slug, icon, color)
│   ├── use-local-storage.ts           # Custom hook for localStorage persistence
│   ├── copy-to-clipboard.ts           # Clipboard helper
│   └── utils.ts                       # Shared utilities (formatBytes, debounce, etc.)
│
├── public/
│   ├── icons/                         # Category SVG icons
│   └── data/                          # Static reference data (currency rates, port list, OUI db)
│
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
├── package.json
└── TOOLS_SPEC.md                      # This file
```

**Key rule: Adding a new tool means touching exactly 3 places:**
1. Add metadata to `lib/tools-registry.ts`
2. Create `components/tools/[tool-slug]/index.tsx`
3. Create `app/tools/[category]/[tool-slug]/page.tsx`

Nothing else changes. No barrel files to update, no imports to add to shared code.

---

## Tool Registry

### `lib/categories.ts`

```typescript
export interface Category {
  slug: string;
  name: string;
  icon: string;       // Emoji or Lucide icon name
  color: string;      // Tailwind color class prefix (e.g., 'blue' for bg-blue-600, text-blue-600, etc.)
  description: string;
}

export const categories: Category[] = [
  { slug: 'text',         name: 'Text & Language',       icon: '✦', color: 'orange',  description: 'Transform, analyze, and generate text' },
  { slug: 'developer',    name: 'Developer Tools',       icon: '⌘', color: 'blue',    description: 'Format, encode, decode, and debug' },
  { slug: 'design',       name: 'Color & Design',        icon: '◆', color: 'purple',  description: 'Pick colors, generate palettes, build CSS' },
  { slug: 'image',        name: 'Image & Media',         icon: '▲', color: 'emerald',  description: 'Resize, convert, edit, and generate media' },
  { slug: 'math',         name: 'Math & Data',           icon: '∑', color: 'yellow',  description: 'Calculate, convert, and visualize numbers' },
  { slug: 'finance',      name: 'Finance & Business',    icon: '◎', color: 'cyan',    description: 'Budgets, loans, invoices, and trackers' },
  { slug: 'security',     name: 'Security & Privacy',    icon: '⬡', color: 'rose',    description: 'Generate passwords, hash data, encrypt notes' },
  { slug: 'productivity', name: 'Productivity',          icon: '✧', color: 'violet',  description: 'Timers, boards, planners, and trackers' },
  { slug: 'health',       name: 'Health & Fitness',      icon: '♦', color: 'orange',  description: 'Calculators and trackers for wellbeing' },
  { slug: 'networking',   name: 'Networking & Sysadmin', icon: '◇', color: 'green',   description: 'Subnet, bandwidth, ports, and DNS' },
  { slug: 'education',    name: 'Education & Learning',  icon: '▽', color: 'blue',    description: 'Quizzes, flashcards, and interactive learning' },
  { slug: 'fun',          name: 'Fun & Creative',        icon: '★', color: 'pink',    description: 'Music, art, games, and creative toys' },
  { slug: 'files',        name: 'File Utilities',        icon: '◫', color: 'lime',    description: 'Merge, split, convert, and clean files' },
  { slug: 'datetime',     name: 'Date & Time',           icon: '◉', color: 'amber',   description: 'Timezones, countdowns, and date math' },
];
```

### `lib/tools-registry.ts`

```typescript
import type { Category } from './categories';

export interface Tool {
  slug: string;                      // URL-friendly ID
  name: string;                      // Display name
  description: string;               // One-line description (also used for meta description)
  category: string;                  // Category slug
  tags: string[];                    // Searchable keywords
  isNew?: boolean;                   // Show "New" badge
  dependencies?: DependencyWeight;   // Heaviest dependency weight class
}

export type DependencyWeight = 'light' | 'medium' | 'heavy' | 'massive';

// Helper functions — these only work with metadata, never import components
export function getToolBySlug(slug: string): Tool | undefined { ... }
export function getToolsByCategory(categorySlug: string): Tool[] { ... }
export function searchTools(query: string): Tool[] { ... }
export function getAllTools(): Tool[] { ... }
```

---

## Shared Tool Shell

Every tool page wraps its interactive widget in a shared `<ToolPage>` component that provides consistent structure:

### `components/layout/tool-page.tsx`

```tsx
interface ToolPageProps {
  tool: Tool;
  children: React.ReactNode;       // The interactive tool widget
  about?: string;                   // Optional "About this tool" markdown
  howTo?: string[];                 // Optional "How to use" steps
}

export function ToolPage({ tool, children, about, howTo }: ToolPageProps) {
  return (
    <div>
      <Breadcrumbs category={tool.category} toolName={tool.name} />
      <h1>{tool.name}</h1>
      <p className="text-muted">{tool.description}</p>

      {/* The actual interactive tool */}
      <div className="tool-container">
        {children}
      </div>

      {/* Below-the-fold content for SEO and user help */}
      {about && <section><h2>About this tool</h2><p>{about}</p></section>}
      {howTo && <section><h2>How to use</h2><ol>{howTo.map(...)}</ol></section>}
    </div>
  );
}
```

This ensures every tool has: breadcrumbs, consistent heading hierarchy, meta tags, and supplementary content for SEO — without each tool reimplementing it.

---

## Shared UI Primitives

Build these reusable components before building individual tools. Most tools compose from these:

| Component | Purpose | Used By |
|-----------|---------|---------|
| `InputOutputLayout` | Responsive two-pane layout (side-by-side on desktop, stacked on mobile). Left = input, right = output. | ~80% of tools |
| `CopyButton` | One-click copy to clipboard with "Copied!" feedback toast | Every tool with text output |
| `DownloadButton` | Download a blob/string as a file with configurable filename and MIME type | Image tools, file tools, generators |
| `FileDropZone` | Drag-and-drop file upload with click fallback, type filtering, size limits | Image, audio, video, PDF, file tools |
| `TabSwitcher` | Simple tab component for mode switching (e.g. "Text" / "File" input modes) | ~40% of tools |
| `CodeBlock` | Syntax-highlighted code display (use `highlight.js` loaded dynamically) | Developer tools |
| `SliderInput` | Labeled range slider with value display | Image tools, audio, design tools |
| `ToggleSwitch` | Labeled on/off toggle | Settings and options across tools |
| `NumberInput` | Numeric input with increment/decrement buttons and min/max | Math, finance, unit tools |
| `ColorInput` | Color picker that shows hex value and syncs with a native `<input type="color">` | Design tools |
| `LoadingSpinner` | Spinner with optional label ("Loading PDF engine...") | Dynamic import fallbacks |
| `ToolSkeleton` | Skeleton shimmer placeholder matching InputOutputLayout shape | Loading state for all tools |
| `Card` | Simple bordered card for grouping output stats | Counters, analyzers, calculators |
| `ResultBadge` | Pass/fail or status badge (green/red/yellow) | Validators, checkers |
| `SearchInput` | Search field with debounced onChange | Homepage, reference tools |

---

## Shared UX Patterns

Apply these to every tool for consistency:

1. **Input → Output layout**: Use `InputOutputLayout`. Left/top = input (textarea, file drop, form). Right/bottom = output (result, preview, download). Never put inputs and outputs in an ambiguous single area.

2. **Copy to Clipboard**: Every tool that produces text output includes a `CopyButton`. Position it at the top-right of the output area.

3. **Download**: If the output is a file (image, PDF, CSV, audio), include a `DownloadButton` with a sensible default filename (e.g. `resized-image.png`, `merged.pdf`).

4. **Clear / Reset**: Every tool has a clear button that resets all inputs and outputs to their default state.

5. **Responsive**: Stacked on mobile (<768px), side-by-side on desktop. All interactive elements have minimum 44px touch targets.

6. **No page reload**: All processing happens in-browser. No form submissions, no navigation on action.

7. **URL structure**: `/tools/[category]/[tool-slug]` — clean, human-readable, bookmarkable.

8. **Dark mode**: Full dark mode support via Tailwind `dark:` classes. Toggle in header. Persist preference in localStorage.

9. **Accessibility**: Proper `<label>` elements, `aria-` attributes where needed, keyboard navigation for all interactive controls, visible focus rings, screen reader announcements for copy/download actions.

10. **Error handling**: Show inline error messages for invalid input (red border + message below field). Never use `alert()`. Never let the tool crash silently.

11. **Empty state**: When the tool first loads, show a helpful prompt ("Paste your JSON here", "Drop an image to get started") rather than a blank area.

---

## Categories & Tools

Below is the master list of every tool, organized by category. Each entry includes the slug, description, and specific implementation notes.

---

### 1. Text & Language

**Category slug**: `text` · **Color**: `orange`

| # | Tool | Slug | Description | Implementation Notes |
|---|------|------|-------------|----------------------|
| 1 | Word & Character Counter | `word-counter` | Count words, characters, sentences, paragraphs with readability scores (Flesch-Kincaid, Gunning Fog) | Textarea input. Real-time counts in card grid below. Readability scores in a secondary row. **Deps**: light (pure JS string analysis). |
| 2 | Markdown Editor | `markdown-editor` | Live split-pane editor with instant HTML preview and export | Use `InputOutputLayout` with textarea left, rendered HTML right. Export as `.md` or `.html`. **Deps**: medium (`marked` or `markdown-it` — dynamic import on mount). |
| 3 | Lorem Ipsum Generator | `lorem-ipsum` | Generate placeholder text in multiple styles (classic, hipster, corporate) | Controls: paragraph count slider, style dropdown. Output textarea with copy. **Deps**: light (bundled word lists). |
| 4 | Case Converter | `case-converter` | Transform text between camelCase, snake_case, PascalCase, Title Case, UPPER, lower, kebab-case | Textarea input. Row of buttons for each case. Output textarea with copy. **Deps**: light. |
| 5 | Text Diff Tool | `text-diff` | Side-by-side comparison with highlighted additions, deletions, and changes | Two textareas. Color-coded diff output. **Deps**: medium (`diff` library — dynamic import on mount). |
| 6 | Regex Tester | `regex-tester` | Test regular expressions with real-time match highlighting, capture groups, and cheat sheet | Regex input + flags checkboxes (g, i, m, s). Test string textarea. Highlight matches inline. Show capture groups table. Collapsible cheat sheet. **Deps**: light (native RegExp). |
| 7 | Morse Code Translator | `morse-code` | Encode/decode Morse code with audio playback via Web Audio API | Text ↔ Morse toggle. Play button generates dot/dash tones using `AudioContext` oscillator. **Deps**: light (bundled lookup table + Web Audio API). |
| 8 | Word Frequency Analyzer | `word-frequency` | Visualize most-used words in text — useful for SEO and writing | Textarea input. Sortable table: word → count. Optional bar chart. Stop word toggle. **Deps**: light. |
| 9 | Text Similarity Checker | `text-similarity` | Compare two texts using cosine similarity to detect overlap | Two textareas. Similarity percentage output. Shared n-grams display. **Deps**: light. |
| 10 | Name & Username Generator | `name-generator` | Random name generator with filters for style, length, and theme | Style dropdown (fantasy, tech, human). Length slider. Generate N names. Copy list. **Deps**: light (bundled name parts). |
| 11 | Text-to-Speech Previewer | `text-to-speech` | Preview text in browser voices and speeds using SpeechSynthesis API | Textarea + voice dropdown (from `speechSynthesis.getVoices()`). Rate and pitch sliders. Play/pause/stop. **Deps**: light (native API). |
| 12 | Transliteration Tool | `transliteration` | Convert between writing systems — Latin ↔ Cyrillic | Source/target script dropdowns. Textarea input → output. **Deps**: light (bundled char maps). |
| 13 | Slug Generator | `slug-generator` | Turn any title into a URL-friendly slug | Input field. Output with copy. Options: separator (- or _), max length, lowercase. **Deps**: light. |
| 14 | String Escaper/Unescaper | `string-escaper` | Escape and unescape for HTML, JSON, URL, XML, CSV | Tabs for each context. Input ↔ output textareas. Bidirectional. **Deps**: light. |
| 15 | Whitespace Cleaner | `whitespace-cleaner` | Strip trailing spaces, normalize line endings, remove invisible Unicode | Textarea input. Checkboxes per cleaning option. Show diff of changes. **Deps**: light. |
| 16 | Reverse Text / Mirror | `reverse-text` | Reverse, flip, or mirror text — character-level or word-level | Input textarea. Buttons: reverse chars, reverse words, flip upside down (Unicode combining). **Deps**: light. |
| 17 | Unicode Character Lookup | `unicode-lookup` | Search, browse, and copy Unicode symbols, emojis, and special characters | Search bar. Grid of characters. Click to copy. Category filter tabs. Codepoint info on hover. **Deps**: light (bundled subset of Unicode data). |
| 18 | Zalgo Text Generator | `zalgo-text` | Add combining characters to text for stylistic/meme use | Textarea input. Intensity slider (mini/normal/max). Output with copy. **Deps**: light. |

---

### 2. Developer Tools

**Category slug**: `developer` · **Color**: `blue`

| # | Tool | Slug | Description | Implementation Notes |
|---|------|------|-------------|----------------------|
| 1 | JSON Formatter & Validator | `json-formatter` | Pretty-print, validate, minify, and view JSON as a collapsible tree | Textarea input. Buttons: format, minify, validate. Tree view with expand/collapse. Error messages on invalid JSON. **Deps**: light (native `JSON.parse`). |
| 2 | Base64 Encoder/Decoder | `base64` | Encode and decode text or files to/from Base64 | Text mode: textarea ↔ textarea. File mode: `FileDropZone` → base64 string. Bidirectional toggle. **Deps**: light (native `btoa`/`atob`). |
| 3 | URL Encoder/Decoder | `url-encoder` | Percent-encode and decode URL components | Two textareas. Encode/decode buttons. Full URL vs component mode toggle. **Deps**: light. |
| 4 | JWT Decoder | `jwt-decoder` | Paste a JWT and see decoded header, payload, and expiration | Single input. Display header + payload as formatted JSON. Expiry status badge (expired=red, valid=green). **Deps**: light (base64 decode + JSON parse). |
| 5 | JWT Builder | `jwt-builder` | Craft and sign JWTs with a user-provided secret | Form fields for header/payload claims. Secret input. Algorithm selector. Output signed JWT. **Deps**: light (Web Crypto for HMAC signing). |
| 6 | UUID / ULID Generator | `uuid-generator` | Generate v4 UUIDs, ULIDs, nanoids — bulk and copy | Buttons per type. Quantity input (1–100). List output with copy-all. Use `crypto.randomUUID()`. **Deps**: light. |
| 7 | Cron Expression Builder | `cron-builder` | Visual cron schedule builder with human-readable descriptions and next-run preview | Dropdowns/inputs for minute, hour, day, month, weekday. Show expression string. Human description. Next 5 run times. **Deps**: light (custom parser). |
| 8 | HTML Entity Encoder | `html-entities` | Encode/decode HTML entities — named and numeric | Two textareas, bidirectional. Named vs numeric toggle. **Deps**: light. |
| 9 | SQL Formatter | `sql-formatter` | Beautify and indent raw SQL queries | Textarea input → formatted output. Options: indent size, uppercase keywords, dialect. **Deps**: medium (`sql-formatter` — dynamic import on mount). |
| 10 | CSS Flexbox Playground | `flexbox-playground` | Toggle every flex property and see layout changes in real time | Visual container with child boxes. Sidebar controls for all flex properties. Live preview. CSS output with copy. **Deps**: light. |
| 11 | CSS Grid Playground | `grid-playground` | Visual grid builder — define rows, columns, gaps, place items | Controls for template-rows/columns/gap. Add/remove items. Drag to place. CSS output. **Deps**: light. |
| 12 | Open Graph Previewer | `og-preview` | Paste HTML meta tags and preview social cards | Textarea for HTML/meta tags. Preview cards mimicking Twitter, Facebook, LinkedIn, Slack sharing. **Deps**: light (HTML parsing with DOM API). |
| 13 | Responsive Breakpoint Tester | `breakpoint-tester` | Preview a URL at common device widths | URL input. Iframes at 320px, 768px, 1024px, 1440px. Note: CORS limited. **Deps**: light. |
| 14 | Snippet Manager | `snippet-manager` | Save, tag, and search code snippets in localStorage | CRUD interface. Language tag, title, code body. Search. Syntax highlighting. localStorage persistence. **Deps**: medium (`highlight.js` — dynamic import on mount). |
| 15 | API Response Mocker | `api-mocker` | Define mock endpoints and responses for frontend dev | Form: method, path, status code, response body. List defined mocks. Export/import JSON config. **Deps**: light. |
| 16 | Diff / Patch Viewer | `diff-viewer` | Visualize unified diffs with syntax highlighting | Textarea for unified diff. Render as side-by-side or inline with color coding. **Deps**: light (custom parser). |
| 17 | Timestamp Converter | `timestamp-converter` | Convert between Unix epoch, ISO 8601, RFC 2822, and human-readable | Input field (auto-detect format). Show all formats simultaneously. "Now" button. **Deps**: light. |
| 18 | YAML ↔ JSON Converter | `yaml-json` | Convert between YAML and JSON | Two textareas. Bidirectional toggle. **Deps**: medium (`js-yaml` — dynamic import on mount). |
| 19 | CSV ↔ JSON Converter | `csv-json` | Transform CSV to JSON array and vice versa | Two textareas. Bidirectional. Delimiter and header row options. **Deps**: medium (`PapaParse` — dynamic import on mount). |
| 20 | XML ↔ JSON Converter | `xml-json` | Bidirectional XML and JSON conversion | Two textareas with format toggle. **Deps**: light (DOMParser). |
| 21 | TOML ↔ JSON Converter | `toml-json` | Parse and convert TOML configuration files | Two textareas. **Deps**: medium (TOML parser — dynamic import on mount). |
| 22 | HTTP Status Code Reference | `http-status-codes` | Searchable reference of all status codes | Search + filter. Group by 1xx–5xx. Expand for details. **Deps**: light (bundled data). |
| 23 | Chmod Calculator | `chmod-calculator` | Visual permission calculator for Unix file permissions | 3×3 checkbox grid (owner/group/other × r/w/x). Bidirectional: checkboxes ↔ octal ↔ symbolic. **Deps**: light. |
| 24 | User-Agent Parser | `user-agent-parser` | Parse a user-agent string into browser, OS, device details | Input field. Parsed output cards. "Use mine" auto-fill button. **Deps**: light (regex-based parser). |
| 25 | Markdown Table Generator | `markdown-table` | Visual table editor that outputs Markdown or HTML | Editable grid. Add rows/columns. Alignment controls per column. Output as Markdown or HTML with copy. **Deps**: light. |
| 26 | Epoch Countdown | `epoch-countdown` | Live ticking Unix timestamp with conversion | Large live-updating epoch display. Input field to convert date ↔ epoch. **Deps**: light. |

---

### 3. Color & Design

**Category slug**: `design` · **Color**: `purple`

| # | Tool | Slug | Description | Implementation Notes |
|---|------|------|-------------|----------------------|
| 1 | Color Picker & Converter | `color-picker` | Pick colors and convert between HEX, RGB, HSL, HSB, CMYK | Native color input + text fields per format. All stay in sync. Large preview swatch. **Deps**: light. |
| 2 | CSS Gradient Generator | `gradient-generator` | Build linear, radial, and conic gradients with visual stops | Gradient preview. Add/remove/drag stops. Type toggle. Angle control. CSS output with copy. **Deps**: light. |
| 3 | Contrast Ratio Checker | `contrast-checker` | Check color pairs against WCAG AA/AAA | Two color inputs. Show ratio. Pass/fail badges for AA, AAA, large text. Live text preview. **Deps**: light. |
| 4 | Color Palette Generator | `palette-generator` | Generate harmonious palettes — complementary, analogous, triadic | Base color input. Harmony type dropdown. Show palette with hex values. Lock colors and regenerate. **Deps**: light. |
| 5 | Color Palette Extractor | `palette-extractor` | Upload an image and extract dominant colors | `FileDropZone` for image. Canvas `getImageData` + median cut quantization. Show top 5–8 colors. **Deps**: light (Canvas API). |
| 6 | Duotone Image Filter | `duotone-filter` | Apply duotone color effects using Canvas API | Image upload. Two color pickers (shadow + highlight). Canvas pixel manipulation. Download result. **Deps**: light. |
| 7 | Font Pairing Previewer | `font-pairing` | Browse and preview Google Font combinations | Two dropdowns (Google Fonts API via `<link>`). Preview heading + body text. Adjustable size/weight/spacing. **Deps**: light (fonts load via CSS). |
| 8 | Box Shadow Generator | `box-shadow` | Visual CSS box-shadow builder with multiple layers | Sliders: x, y, blur, spread, color, opacity. Multiple layers. Live preview + CSS output. **Deps**: light. |
| 9 | Border Radius Previewer | `border-radius` | Drag corners to create complex border-radius values | Visual box with draggable handles. Shorthand and longhand CSS output. Presets. **Deps**: light. |
| 10 | CSS Animation Builder | `animation-builder` | Keyframe timeline editor with easing curves and live preview | Timeline UI. Add keyframes with properties. Easing selector. CSS @keyframes output. **Deps**: light. |
| 11 | Glassmorphism Generator | `glassmorphism` | Create frosted glass effects with CSS output | Sliders: blur, opacity, saturation, border. Preview over background image. CSS output. **Deps**: light. |
| 12 | Neumorphism Generator | `neumorphism` | Design soft UI elements with shadows | Background color picker. Size/radius/distance/intensity/blur sliders. Flat/concave/convex toggle. CSS output. **Deps**: light. |
| 13 | Pattern / Texture Generator | `pattern-generator` | Generate repeating CSS/SVG patterns | Pattern type selector. Color, size, spacing controls. CSS and SVG output. **Deps**: light. |
| 14 | Mockup Frame Generator | `mockup-generator` | Place screenshots into device frames | Upload screenshot. Select device. Position and scale. Download composited image via Canvas. **Deps**: light (bundled device frame SVGs). |
| 15 | Sprite Sheet Generator | `sprite-sheet` | Upload frames and stitch into a spritesheet | Multi-file upload. Grid options (columns, padding). Preview. Download PNG + CSS coordinates. **Deps**: light (Canvas API). |
| 16 | SVG Optimizer / Viewer | `svg-optimizer` | Paste SVG markup, preview, and optimize | Textarea for SVG. Preview panel. Optimize (remove comments, empty groups, defaults). Size reduction display. **Deps**: light (DOM parsing). |
| 17 | Favicon Generator | `favicon-generator` | Generate favicons in all sizes from text, emoji, or image | Input modes: text, emoji, upload. Generate all standard sizes. Download as .ico or zip. **Deps**: medium (`JSZip` for zip download — dynamic import on action). |
| 18 | Tailwind Color Lookup | `tailwind-colors` | Browse and search the full Tailwind color palette | Searchable grid. Click to copy hex or class name. Group by family. **Deps**: light (bundled color data). |
| 19 | Typography Scale Calculator | `type-scale` | Generate a modular type scale from a base size and ratio | Base size input. Ratio selector. Full scale with visual preview + CSS custom properties output. **Deps**: light. |

---

### 4. Image & Media

**Category slug**: `image` · **Color**: `emerald`

| # | Tool | Slug | Description | Implementation Notes |
|---|------|------|-------------|----------------------|
| 1 | Image Resizer & Cropper | `image-resizer` | Resize, crop, and adjust images using Canvas API | Image upload. Width/height inputs with lock-aspect toggle. Crop mode with draggable selection. Download. **Deps**: light (Canvas API). |
| 2 | Image Compressor | `image-compressor` | Reduce file size with adjustable quality | Image upload. Quality slider (0–100). Original vs compressed size. Side-by-side preview. `canvas.toBlob()` with quality. **Deps**: light. |
| 3 | Image Format Converter | `image-converter` | Convert between PNG, JPEG, WebP, BMP | Image upload. Format dropdown. Convert via Canvas. Download. **Deps**: light. |
| 4 | Image to Base64 | `image-to-base64` | Convert image to Base64 data URI | Image upload. Show data URI. Copy button. String length display. **Deps**: light. |
| 5 | EXIF Data Viewer | `exif-viewer` | Inspect embedded photo metadata | Image upload. Parse EXIF. Display as cards: camera, lens, GPS, date, exposure, ISO. **Deps**: medium (`exif-js` — dynamic import on file drop). |
| 6 | QR Code Generator | `qr-generator` | Generate QR codes for URLs, text, Wi-Fi, vCards | Tab modes (URL, text, Wi-Fi, vCard). QR preview. Size/error-correction controls. Download PNG or SVG. **Deps**: medium (`qrcode` — dynamic import on mount). |
| 7 | QR Code Reader | `qr-reader` | Scan QR codes from image or camera | Image upload + camera toggle (`getUserMedia`). Decode with `jsQR`. Display decoded text with copy. **Deps**: medium (`jsQR` — dynamic import on mount). |
| 8 | Barcode Generator | `barcode-generator` | Create Code128, EAN, UPC barcodes | Input value. Format dropdown. Preview + download. **Deps**: medium (`JsBarcode` — dynamic import on mount). |
| 9 | ASCII Art Generator | `ascii-art` | Convert images to ASCII art | Image upload. Width slider (characters). Character set toggle. Render in `<pre>`. Copy and .txt download. **Deps**: light (Canvas API). |
| 10 | Pixel Art Editor | `pixel-art` | Grid-based drawing tool with palette and export | Grid size config (8×8 to 64×64). Color palette + eyedropper. Pencil, fill, eraser. Undo/redo. Export PNG (scaled) or GIF. **Deps**: light (Canvas API). |
| 11 | Placeholder Image Generator | `placeholder-image` | Generate solid/gradient placeholder images | Width, height, color, text overlay, font size inputs. Preview + download. **Deps**: light. |
| 12 | Image Color Replacer | `color-replacer` | Swap specific colors in an image using Canvas | Image upload. Source color (eyedropper from image). Target color. Tolerance slider. Apply + download. **Deps**: light. |
| 13 | Photo Collage Maker | `collage-maker` | Arrange multiple images into grid layouts | Multi-image upload. Template grid selector. Drag to reorder. Gap/padding controls. Export via Canvas. **Deps**: light. |
| 14 | Watermark Tool | `watermark` | Add text or image watermarks to photos | Image upload. Text or image watermark. Position grid, opacity, size, rotation. Download via Canvas. **Deps**: light. |
| 15 | Audio Trimmer | `audio-trimmer` | Trim audio clips in-browser using Web Audio API | Audio upload. Waveform display (Canvas). Draggable start/end markers. Play selection. Export trimmed clip. **Deps**: light (Web Audio API). |
| 16 | Video to GIF Converter | `video-to-gif` | Extract video frames into animated GIF | Video upload. Frame range selector. FPS and width controls. **Deps**: massive (`ffmpeg.wasm` — load on explicit user action with progress bar). |
| 17 | Waveform Visualizer | `waveform-visualizer` | Upload audio and see its waveform on Canvas | Audio upload. Waveform via `AudioContext.decodeAudioData()` + Canvas. Color customization. Export PNG. **Deps**: light. |
| 18 | Screen Recorder | `screen-recorder` | Record screen/tab using MediaRecorder API | Start/stop. Source selector (screen, window, tab). Download .webm. **Deps**: light (native APIs). |
| 19 | Webcam Photo Booth | `webcam-booth` | Capture webcam snapshots with filters | Camera preview (`getUserMedia`). Countdown timer. CSS filter toggles. Capture + download. **Deps**: light. |

---

### 5. Math & Data

**Category slug**: `math` · **Color**: `yellow`

| # | Tool | Slug | Description | Implementation Notes |
|---|------|------|-------------|----------------------|
| 1 | Unit Converter | `unit-converter` | Convert length, weight, volume, temperature, speed, area, data | Category tabs. From/to dropdowns. Input → output. Swap button. **Deps**: light (bundled conversion factors). |
| 2 | Percentage Calculator | `percentage-calculator` | Calculate percentages, percentage change, ratios | Multiple modes: "X% of Y", "X is what % of Y", "% change X→Y". Tab selector. **Deps**: light. |
| 3 | Hex / Binary / Decimal Converter | `number-base-converter` | Convert between hex, binary, octal, decimal | Input + base selector. Show all 4 bases simultaneously. **Deps**: light. |
| 4 | Matrix Calculator | `matrix-calculator` | Add, multiply, transpose, invert, determinants | Two matrix inputs (configurable size). Operation selector. Result display. **Deps**: light. |
| 5 | Statistics Calculator | `statistics-calculator` | Mean, median, mode, std dev, variance, quartiles | Textarea for numbers (comma or newline separated). Output all stats in cards. Optional histogram. **Deps**: light. |
| 6 | Scientific Calculator | `scientific-calculator` | Full calculator with trig, log, exponents, history | Calculator button UI. History display. Keyboard support. **Deps**: light (`Math` functions). |
| 7 | Graphing Calculator | `graphing-calculator` | Plot mathematical functions on coordinate plane | Function input. Canvas graph. Zoom/pan. Multiple functions with colors. **Deps**: heavy (`mathjs` — dynamic import on mount). |
| 8 | Boolean Algebra Simplifier | `boolean-algebra` | Simplify logic expressions and generate truth tables | Expression input. Simplified output. Truth table. **Deps**: light (custom parser). |
| 9 | Roman Numeral Converter | `roman-numerals` | Convert between Roman and Arabic numbers | Bidirectional input with auto-detect. **Deps**: light. |
| 10 | Number to Words | `number-to-words` | Convert numeric values to written English | Number input → words output. Handle negatives, decimals, large numbers. **Deps**: light. |
| 11 | Bitwise Operation Visualizer | `bitwise-visualizer` | Visualize AND, OR, XOR, NOT, shifts bit-by-bit | Two number inputs. Operation selector. Binary representation with highlighted result. **Deps**: light. |
| 12 | Probability Calculator | `probability-calculator` | Permutations, combinations, dice, cards | Mode tabs. Show formula and result. **Deps**: light. |
| 13 | Aspect Ratio Calculator | `aspect-ratio` | Calculate and convert aspect ratios | Width/height inputs. Show ratio. Lock and resize. Presets (16:9, 4:3, 1:1, 21:9). **Deps**: light. |
| 14 | Data Size Converter | `data-size-converter` | Convert between bytes, KB, MB, GB, TB | Input + unit dropdown. Show all units. Binary vs decimal toggle. **Deps**: light. |
| 15 | Random Number Generator | `random-generator` | Random numbers, dice, coins, lottery | Mode tabs. History log. Configurable parameters. **Deps**: light. |
| 16 | Number Base Converter | `arbitrary-base-converter` | Convert between any base (2–36) with step-by-step | Source/target base dropdowns. Show conversion steps. **Deps**: light. |

---

### 6. Finance & Business

**Category slug**: `finance` · **Color**: `cyan`

| # | Tool | Slug | Description | Implementation Notes |
|---|------|------|-------------|----------------------|
| 1 | Compound Interest Calculator | `compound-interest` | Growth over time with chart | Inputs: principal, rate, time, frequency. Line chart. Final amount + total interest. **Deps**: light (Canvas or SVG chart). |
| 2 | Mortgage / Loan Calculator | `mortgage-calculator` | Monthly payments, amortization, total interest | Amount, rate, term inputs. Monthly payment. Amortization table. Pie chart. **Deps**: light. |
| 3 | Tip / Bill Splitter | `tip-calculator` | Split bills with custom tip and rounding | Bill, tip %, people. Per-person amount. Round option. **Deps**: light. |
| 4 | Currency Converter | `currency-converter` | Convert between currencies | Two dropdowns + amount. Bundled static rates JSON (with date disclaimer). Swap button. **Deps**: light. |
| 5 | Subscription Tracker | `subscription-tracker` | List subscriptions, see totals | CRUD list: name, cost, frequency. Monthly/yearly totals. localStorage. **Deps**: light. |
| 6 | Net Worth Tracker | `net-worth-tracker` | Track assets and liabilities over time | Asset/liability categories. Monthly snapshots. Line chart. localStorage. **Deps**: light. |
| 7 | 50/30/20 Budget Planner | `budget-planner` | Allocate income into needs, wants, savings | Income input. Auto split. Custom percentages. Donut chart. **Deps**: light. |
| 8 | Debt Snowball/Avalanche Calculator | `debt-calculator` | Compare payoff strategies | Multiple debts input. Extra payment. Side-by-side strategy comparison with timelines. **Deps**: light. |
| 9 | Tax Estimator (Freelancer) | `tax-estimator` | Rough tax estimate by income and deductions | Country/region selector (basic brackets for US, AU, UK, CA). Income/deductions. Estimated tax + effective rate. Disclaimer. **Deps**: light (bundled bracket data). |
| 10 | Invoice Generator | `invoice-generator` | Create invoices and export to PDF | Form: business info, client info, line items. Totals + tax. **Deps**: heavy (`jsPDF` or `html2canvas` — dynamic import on "Generate PDF"). |
| 11 | Salary ↔ Hourly Converter | `salary-converter` | Convert between annual, monthly, weekly, daily, hourly | One input + period selector. All periods shown. Hours/week config. **Deps**: light. |
| 12 | ROI Calculator | `roi-calculator` | Return on investment with periods | Initial, final, time. ROI % and annualized. **Deps**: light. |
| 13 | Break-Even Calculator | `break-even` | Find break-even point | Fixed costs, variable cost/unit, price/unit. Break-even units + revenue. Chart. **Deps**: light. |
| 14 | Savings Goal Tracker | `savings-goal` | Set goals, log deposits, track progress | Goal CRUD. Deposit logging. Progress bar. localStorage. **Deps**: light. |
| 15 | Stock Position Size Calculator | `position-size` | Position sizing based on risk | Account size, risk %, entry, stop loss. Shares and dollar amount. **Deps**: light. |
| 16 | Markup / Margin Calculator | `markup-margin` | Convert between cost, markup %, profit margin | Three linked fields. Change one → update others. **Deps**: light. |

---

### 7. Security & Privacy

**Category slug**: `security` · **Color**: `rose`

| # | Tool | Slug | Description | Implementation Notes |
|---|------|------|-------------|----------------------|
| 1 | Password Generator | `password-generator` | Strong passwords with customizable options | Length slider. Toggles: upper, lower, numbers, symbols. Entropy display. Copy. Bulk option. **Deps**: light (`crypto.getRandomValues`). |
| 2 | Password Strength Checker | `password-strength` | Strength analysis with crack time | Input field. Strength meter. Crack time estimate. Improvement feedback. **Deps**: light (zxcvbn-style scoring — implement a lightweight version or dynamic import). |
| 3 | Hash Generator | `hash-generator` | SHA-1, SHA-256, SHA-512, MD5 of text or files | Text tab + file drop tab. Show all hashes simultaneously. `crypto.subtle.digest()`. Copy per hash. **Deps**: light (Web Crypto API). |
| 4 | File Checksum Verifier | `checksum-verifier` | Drag-and-drop file hash verification | File drop + expected hash input. Compute hash. Match/mismatch badge. **Deps**: light. |
| 5 | Encrypted Notes | `encrypted-notes` | AES-GCM encrypted notepad | Master password entry. Encrypt/decrypt via `crypto.subtle`. Encrypted blob in localStorage. **Deps**: light (Web Crypto API). |
| 6 | Encrypted Vault | `encrypted-vault` | Client-side password manager | Master password → PBKDF2 key derivation. CRUD entries. Encrypted localStorage. Auto-lock timer. **Deps**: light. |
| 7 | HMAC Generator | `hmac-generator` | Generate HMAC signatures | Text, secret key, algorithm selector. Output via `crypto.subtle.sign()`. **Deps**: light. |
| 8 | Random Byte Generator | `random-bytes` | Cryptographically secure random bytes | Byte count input. Output in hex, base64, decimal. `crypto.getRandomValues()`. **Deps**: light. |
| 9 | TOTP Code Generator | `totp-generator` | Time-based one-time passwords (RFC 6238) | Secret key input (base32). TOTP code with countdown. Configurable period/digits. **Deps**: light (Web Crypto HMAC). |
| 10 | Privacy Metadata Stripper | `metadata-stripper` | Remove EXIF from images before sharing | Image upload. Show EXIF. Strip via Canvas re-render. Download clean. **Deps**: light. |
| 11 | Secure Text Sharing Encoder | `secure-share` | Encode message into a URL fragment for client-side decryption | Text + optional password. Encrypt into URL hash. Decoder page. **Deps**: light. |

---

### 8. Productivity

**Category slug**: `productivity` · **Color**: `violet`

| # | Tool | Slug | Description | Implementation Notes |
|---|------|------|-------------|----------------------|
| 1 | Pomodoro Timer | `pomodoro` | Focus timer with configurable intervals and session tracking | Circular progress. Work/short-break/long-break durations. Session counter. Audio notification. localStorage settings. **Deps**: light. |
| 2 | Stopwatch & Lap Timer | `stopwatch` | Precision stopwatch with lap recording | Start/stop/reset. Lap button. Split + cumulative times. Export CSV. **Deps**: light. |
| 3 | Countdown Timer | `countdown` | Count down to a specific date | Date/time picker. Large display: days, hours, minutes, seconds. Title/event name. **Deps**: light. |
| 4 | Kanban Board | `kanban` | Drag-and-drop task board | Default columns: To Do, In Progress, Done. Card CRUD. Drag between columns. Add/rename columns. localStorage. **Deps**: light (HTML Drag API or lightweight DnD). |
| 5 | To-Do List / Checklist | `todo-list` | Task manager with priorities and due dates | Add tasks (title, priority, due date). Check off. Filter/sort. localStorage. **Deps**: light. |
| 6 | Habit Tracker | `habit-tracker` | Daily habits with streaks and heatmap | Add habits. Daily check-in grid (GitHub-style heatmap). Streak counter. localStorage. **Deps**: light. |
| 7 | Notepad with Auto-Save | `notepad` | Distraction-free writing pad | Full-width textarea. Auto-save to localStorage per keystroke. Word count footer. **Deps**: light. |
| 8 | Meeting Cost Calculator | `meeting-cost` | Calculate real cost of a meeting | Attendees, avg salary, duration. Live ticking cost display. **Deps**: light. |
| 9 | Decision Matrix | `decision-matrix` | Score options against weighted criteria | Dynamic table: rows=options, columns=criteria. Weights. Weighted scores. Winner highlight. **Deps**: light. |
| 10 | Eisenhower Matrix | `eisenhower-matrix` | Drag tasks into urgent/important quadrants | 2×2 grid. Add tasks. Drag between quadrants. localStorage. **Deps**: light. |
| 11 | Mind Map Builder | `mind-map` | Branching mind maps with drag-and-drop | Central node + branches. Add child/sibling. Drag to reposition. Canvas/SVG rendering. Export PNG or JSON. **Deps**: light. |
| 12 | Daily Planner / Schedule | `daily-planner` | Time-block your day | Hour grid. Click/drag to create blocks. Title + color per block. localStorage per date. **Deps**: light. |
| 13 | Reading Time Estimator | `reading-time` | Estimate reading time at various speeds | Textarea input. Times at slow (150 wpm), average (250 wpm), fast (400 wpm). Speaking time too. **Deps**: light. |
| 14 | Sticky Notes Wall | `sticky-notes` | Freeform draggable sticky notes | Canvas with DnD notes. Color selector. Double-click to edit. localStorage. **Deps**: light. |
| 15 | Goal Tracker | `goal-tracker` | Goals with milestones and progress bars | CRUD goals + milestones with dates. Progress bar. localStorage. **Deps**: light. |

---

### 9. Health & Fitness

**Category slug**: `health` · **Color**: `orange`

| # | Tool | Slug | Description | Implementation Notes |
|---|------|------|-------------|----------------------|
| 1 | BMI Calculator | `bmi-calculator` | Body Mass Index with visual scale | Height + weight (metric/imperial toggle). BMI + category on colored scale. **Deps**: light. |
| 2 | TDEE & Macro Calculator | `tdee-calculator` | Daily calorie needs and macro targets | Age, gender, height, weight, activity level. TDEE. Macro split sliders. **Deps**: light. |
| 3 | Water Intake Tracker | `water-tracker` | Log daily water consumption | Daily goal. Log glasses/ml. Visual fill indicator. localStorage per day. **Deps**: light. |
| 4 | Sleep Cycle Calculator | `sleep-calculator` | Optimal bedtimes based on 90-min cycles | Two modes: "wake at X" / "sleep at X". Show 4–6 cycle suggestions. **Deps**: light. |
| 5 | HIIT / Tabata Timer | `hiit-timer` | Customizable interval timer with audio | Work/rest durations, rounds. Color-coded countdown. Audio beeps. **Deps**: light (Web Audio API). |
| 6 | Body Measurement Tracker | `body-tracker` | Log measurements over time with charts | Fields: chest, waist, hips, arms, thighs. Date entries. Line charts. localStorage. **Deps**: light. |
| 7 | Calorie Counter | `calorie-counter` | Calorie lookup and daily logging | Search common foods (bundled static DB). Add to daily log. Daily total vs target. localStorage. **Deps**: light (bundled data). |
| 8 | One-Rep Max Calculator | `one-rep-max` | Estimate 1RM from submaximal lifts | Weight + reps. 1RM via Epley, Brzycki, Lombardi. Percentage chart. **Deps**: light. |
| 9 | Pace Calculator | `pace-calculator` | Convert pace, speed, and finish time | Three linked fields. Common distance presets. Metric/imperial toggle. **Deps**: light. |
| 10 | Breathing Exercise Timer | `breathing-timer` | Guided breathing with visual + audio | Presets: box (4-4-4-4), 4-7-8, Wim Hof. Animated circle. Audio cue. Round counter. **Deps**: light. |

---

### 10. Networking & Sysadmin

**Category slug**: `networking` · **Color**: `green`

| # | Tool | Slug | Description | Implementation Notes |
|---|------|------|-------------|----------------------|
| 1 | Subnet Calculator | `subnet-calculator` | Network, broadcast, host range from IP + CIDR | IP input + CIDR dropdown. Show all results. **Deps**: light. |
| 2 | IPv4 ↔ IPv6 Converter | `ip-converter` | Convert between IPv4 and IPv6 | Auto-detect version. Show converted output. **Deps**: light. |
| 3 | CIDR Range Visualizer | `cidr-visualizer` | See which IPs fall within a CIDR block | CIDR input. Visual range. IP membership check. **Deps**: light. |
| 4 | Bandwidth Calculator | `bandwidth-calculator` | Transfer time for file size at given speed | File size + speed inputs. Show time. Reverse mode: target time → required speed. **Deps**: light. |
| 5 | DNS Record Reference | `dns-reference` | Interactive DNS record type reference | Searchable list: A, AAAA, CNAME, MX, etc. Expand for description + example. **Deps**: light. |
| 6 | Port Number Reference | `port-reference` | Searchable common port database | Search/filter. Port, protocol, service, description. **Deps**: light (bundled data). |
| 7 | MAC Address Lookup | `mac-lookup` | Identify vendor from OUI prefix | MAC input. Vendor lookup from bundled OUI data (~50KB top vendors). **Deps**: light. |
| 8 | Network Mask Calculator | `netmask-calculator` | Convert between dotted-decimal, CIDR, wildcard | Input any format → show all three. Bit visualization. **Deps**: light. |

---

### 11. Education & Learning

**Category slug**: `education` · **Color**: `blue`

| # | Tool | Slug | Description | Implementation Notes |
|---|------|------|-------------|----------------------|
| 1 | Typing Speed Test | `typing-test` | WPM with accuracy and difficulty levels | Random prompts. Real-time WPM + accuracy. Color-code chars. High scores in localStorage. **Deps**: light. |
| 2 | Flashcard App | `flashcards` | Spaced repetition (Leitner) stored locally | Deck CRUD. Study mode with box advancement. Stats. Import/export JSON. localStorage. **Deps**: light. |
| 3 | Mental Math Trainer | `mental-math` | Timed arithmetic drills | Random problems. Difficulty levels. Timer. Score tracking. Streaks. **Deps**: light. |
| 4 | Periodic Table Explorer | `periodic-table` | Interactive periodic table | Grid-rendered table. Click → detail panel. Color by category. Search. **Deps**: light (bundled element data). |
| 5 | Geography Quiz | `geography-quiz` | Identify countries on SVG world map | SVG map. Two modes: name→click, highlight→name. Score tracking. Region filters. **Deps**: light (bundled SVG map). |
| 6 | Music Interval Trainer | `interval-trainer` | Hear two notes, guess the interval | Web Audio API oscillator. Multiple choice. Score tracking. Adjustable range. **Deps**: light. |
| 7 | Language Vocabulary Builder | `vocabulary-builder` | Words + translations with spaced repetition | CRUD words. Quiz mode. Spaced repetition. localStorage. **Deps**: light. |
| 8 | Times Table Trainer | `times-tables` | Multiplication drills with visual feedback | 1–12 grid. Random problems. Timer. Stars/streaks. Per-table progress. **Deps**: light. |
| 9 | Color Blindness Simulator | `color-blind-sim` | Preview images with color vision deficiencies | Image upload. CVD type dropdown. Canvas color matrix. Side-by-side. **Deps**: light. |
| 10 | Binary / Hex Teaching Tool | `binary-teacher` | Interactive binary ↔ decimal ↔ hex | Input any format. Annotated conversion steps. Clickable bit toggles. **Deps**: light. |
| 11 | Algorithm Visualizer | `algorithm-visualizer` | Watch sorting/search algorithms step-by-step | Algorithm selector. Animated bar chart (Canvas or DOM). Speed control. Step/auto modes. **Deps**: light. |

---

### 12. Fun & Creative

**Category slug**: `fun` · **Color**: `pink`

| # | Tool | Slug | Description | Implementation Notes |
|---|------|------|-------------|----------------------|
| 1 | Drum Machine / Beat Maker | `drum-machine` | Sequencer with Web Audio API | 16-step grid × instrument rows. Toggle cells. BPM control. Play/stop. Web Audio with generated or bundled samples. **Deps**: light. |
| 2 | Generative Art Tool | `generative-art` | Parameter-driven pattern creation | Canvas rendering. Algorithms: spirals, flow fields, fractals. Parameter sliders. Randomize. Export PNG. **Deps**: light. |
| 3 | Meme Generator | `meme-generator` | Upload image, add draggable text overlays | Image upload. Draggable/resizable text boxes. Font, size, color, stroke controls. Export via Canvas. **Deps**: light. |
| 4 | Soundboard | `soundboard` | Upload and trigger audio clips | Pad grid. Upload audio per pad. Click or keyboard trigger. Labels + colors. **Deps**: light. |
| 5 | Conway's Game of Life | `game-of-life` | Cellular automaton | Canvas grid. Click to toggle cells. Play/pause/step. Speed slider. Presets. Clear + randomize. **Deps**: light. |
| 6 | Procedural Terrain Generator | `terrain-generator` | Landscape generation using noise | Canvas/WebGL. Parameters: octaves, persistence, scale, seed. Color mapping. 2D top-down view. **Deps**: light. |
| 7 | Drawing Canvas | `drawing-canvas` | Freehand drawing with brushes | Canvas tools: pencil, line, rect, circle, fill. Color picker, brush size. Undo/redo. Clear. Export PNG. **Deps**: light. |
| 8 | Fortune / Magic 8-Ball | `magic-8-ball` | Random answers with animation | Text input (optional). Animated shake (CSS 3D transforms). Random response. **Deps**: light. |
| 9 | Dice Roller (D&D) | `dice-roller` | Roll polyhedral dice with history | d4, d6, d8, d10, d12, d20, d100 buttons. Quantity input. Roll animation. History log. **Deps**: light. |
| 10 | Noise / Ambient Sound Generator | `ambient-sounds` | Layer noise and nature sounds | Multiple channels with volume sliders. Web Audio API noise generation. Optional timer. **Deps**: light. |
| 11 | CSS Art Playground | `css-art` | Create illustrations using only CSS | Editable CSS + live preview. Starter templates. Copy CSS output. **Deps**: light. |
| 12 | Emoji Picker / Search | `emoji-search` | Search emojis with copy to clipboard | Search bar. Category tabs. Emoji grid. Click to copy. Name + codepoint. Skin tone selector. **Deps**: light (bundled emoji data). |
| 13 | Random Color Palette Game | `palette-game` | Vote on random palettes to train color sense | Two palettes side by side. Pick the better one. Track preferences. New matchup. **Deps**: light. |

---

### 13. File Utilities

**Category slug**: `files` · **Color**: `lime`

| # | Tool | Slug | Description | Implementation Notes |
|---|------|------|-------------|----------------------|
| 1 | PDF Merger | `pdf-merger` | Combine multiple PDFs into one | Multi-file upload. Drag to reorder. Show page count per file. **Deps**: heavy (`pdf-lib` — dynamic import on file drop). |
| 2 | PDF Splitter | `pdf-splitter` | Extract specific pages from a PDF | PDF upload. Page count display. Range input (e.g. "1-3, 5, 7-10"). **Deps**: heavy (`pdf-lib`). |
| 3 | PDF Page Rotator | `pdf-rotator` | Rotate pages in a PDF | PDF upload. Thumbnail preview. Rotate buttons per page. **Deps**: heavy (`pdf-lib`). |
| 4 | File Size Analyzer | `file-size-analyzer` | Drag-and-drop file size breakdown | Multi-file drop. Name, size, type per file. Total. Pie chart by type. Sort. **Deps**: light. |
| 5 | Text File Merger | `text-merger` | Concatenate multiple text/CSV files | Multi-file upload. Drag to reorder. Separator option. Preview. Download. **Deps**: light. |
| 6 | Markdown → HTML Converter | `markdown-to-html` | Convert Markdown to clean HTML | Textarea or file upload. HTML output. Include-styles option. Download .html. **Deps**: medium (`marked`). |
| 7 | HTML → Markdown Converter | `html-to-markdown` | Turn HTML into Markdown | Textarea input. Markdown output. Handle tables, links, images, lists. Download .md. **Deps**: medium (turndown or custom). |
| 8 | JSON to CSV Exporter | `json-to-csv` | Flatten JSON arrays into CSV | Textarea or file upload. Auto-detect structure. Preview table. Download .csv. **Deps**: light. |
| 9 | ZIP File Creator | `zip-creator` | Bundle files into a .zip | Multi-file drop. File list. Download zip. **Deps**: heavy (`JSZip` — dynamic import on "Create ZIP"). |
| 10 | File Rename Batch Tool | `file-renamer` | Batch rename with patterns | Multi-file upload. Pattern: prefix, suffix, find/replace, numbering. Preview. Download zip. **Deps**: heavy (`JSZip`). |
| 11 | Plain Text Cleaner | `text-cleaner` | Fix encoding, remove smart quotes, normalize | Textarea. Checkboxes: encoding fix, smart quotes, whitespace, strip HTML, dedup lines. Diff view. **Deps**: light. |

---

### 14. Date & Time

**Category slug**: `datetime` · **Color**: `amber`

| # | Tool | Slug | Description | Implementation Notes |
|---|------|------|-------------|----------------------|
| 1 | Timezone Converter | `timezone-converter` | Convert time across multiple timezones | Time input + source tz. Add target timezones. Show all. `Intl.DateTimeFormat`. **Deps**: light. |
| 2 | Date Difference Calculator | `date-difference` | Days, weeks, months, years between dates | Two date pickers. Multiple units. Include/exclude end date. **Deps**: light. |
| 3 | Date Adder/Subtractor | `date-add-subtract` | Add or subtract time from a date | Date picker + number + unit dropdown. Result date. **Deps**: light. |
| 4 | Week Number Lookup | `week-number` | ISO week number for any date | Date picker → week number. Reverse: week → date range. Current week highlighted. **Deps**: light. |
| 5 | Age Calculator | `age-calculator` | Exact age in years, months, days | Birthdate input. Exact age + next birthday countdown. Fun facts: days/hours alive. **Deps**: light. |
| 6 | Working Days Calculator | `working-days` | Business days between two dates | Two date pickers. Exclude weekends. Optional holiday list. **Deps**: light. |
| 7 | Calendar Generator | `calendar-generator` | Printable monthly/yearly calendars | Month/year selector. Clean calendar render. Highlight today. Print CSS. Export image. **Deps**: light. |
| 8 | Timezone Meeting Planner | `meeting-planner` | Find overlapping working hours | Add timezones with working hours. Visual timeline. Highlight overlap. **Deps**: light. |
| 9 | Relative Time Display | `relative-time` | See dates as relative strings | Date/time input. Show "3 days ago", "in 2 months", etc. Live-updating. **Deps**: light. |

---

## Implementation Priority

Build in waves. Ship each phase as a working site before starting the next.

### Phase 1 — Foundation + Core Tools (ship first)

**First**: Build the app shell (layout, sidebar, homepage, search, routing, theme toggle, shared UI primitives). No tools yet — just the skeleton with the registry showing "Coming soon" states.

**Then** implement these 10 high-value, universally useful tools:

1. `json-formatter` (Developer) — light deps, high traffic
2. `base64` (Developer) — light deps, universally needed
3. `color-picker` (Design) — light deps, visual showcase
4. `password-generator` (Security) — light deps, everyone needs this
5. `uuid-generator` (Developer) — light deps, quick win
6. `word-counter` (Text) — light deps, simple
7. `unit-converter` (Math) — light deps, broad appeal
8. `timestamp-converter` (Developer) — light deps, constant need
9. `hash-generator` (Security) — light deps, Web Crypto showcase
10. `qr-generator` (Image) — medium deps, highly shareable

### Phase 2 — High Value

11–20: `regex-tester`, `image-resizer`, `gradient-generator`, `markdown-editor`, `mortgage-calculator`, `pomodoro`, `subnet-calculator`, `jwt-decoder`, `cron-builder`, `contrast-checker`

### Phase 3 — Engagement & Stickiness

21–30: `typing-test`, `kanban`, `flashcards`, `pixel-art`, `drum-machine`, `game-of-life`, `algorithm-visualizer`, `habit-tracker`, `invoice-generator`, `pdf-merger`

### Phase 4 — Complete the Catalog

Remaining tools in any order. Prioritize by user demand.

---

## SEO & Discoverability

- **Unique `<title>`** per tool page: `"{Tool Name} — Free Online Tool | Abzar"`
- **Unique `<meta name="description">`** per tool: use the `description` field from the registry
- **`<h1>`** on every tool page with the tool name
- **Structured data** (JSON-LD): `WebApplication` schema per tool page
- **Clean URLs**: `/tools/developer/json-formatter`
- **Sitemap**: Auto-generate `sitemap.xml` from the tool registry at build time
- **OpenGraph + Twitter Card** meta tags per page (og:title, og:description, og:image)
- **About/How-to sections** below each tool for crawlable content
- **Internal linking**: "Related tools" section at the bottom of each tool page
- **Category pages** (`/tools/developer`) with descriptions and tool listings act as landing pages

---

## Performance Budgets

| Metric | Target |
|--------|--------|
| **Shared shell** (layout, nav, registry, UI primitives) | < 50KB gzipped |
| **Simple tool page** (light deps) | < 30KB gzipped (tool component chunk) |
| **Medium tool page** (medium deps) | < 80KB gzipped |
| **Heavy tool page** (on action) | Library loads on user action, not page load |
| **First Contentful Paint** | < 1.5s |
| **Largest Contentful Paint** | < 2.5s |
| **Time to Interactive** | < 3.5s |
| **Cumulative Layout Shift** | < 0.1 |

**Measurement**: Run Lighthouse on the homepage and 3 representative tool pages (one light, one medium, one heavy) after each phase.

---

## Notes for Claude Code

### Workflow

1. **Build the shell first.** Layout, sidebar, homepage, search, routing, theme toggle, and all shared UI primitives. The registry should be populated with all 197 tools in `status: 'planned'` state. The homepage and category pages should show all tools with a "Coming soon" badge for unimplemented ones.

2. **Implement one tool at a time.** Each tool is a self-contained unit. Build the component, create the route page, flip `status` to `'live'` in the registry. Commit.

3. **Follow the Phase order.** Phase 1 core tools first. They exercise the shared primitives and establish patterns that later tools reuse.

### Rules

- **Never import tool components into shared code.** The registry is pure metadata. The sidebar reads slugs and names, not components.
- **Never create barrel files** (`index.ts` re-exporting multiple tools). Each tool is imported individually at its route.
- **Use `next/dynamic`** for every tool component import in `page.tsx` files.
- **Use dynamic `import()`** for any dependency over 20KB. Trigger on mount for medium deps, on user action for heavy deps.
- **Every tool must use the shared `<ToolPage>` wrapper** for consistent structure and SEO.
- **Every tool must use shared UI primitives** (`CopyButton`, `FileDropZone`, `InputOutputLayout`, etc.) rather than reimplementing common patterns.
- **Test edge cases**: empty input, extremely long input, special characters/Unicode, mobile viewport, dark mode.
- **Keep each tool component under 300 lines.** If it's growing past that, extract logic into a `utils.ts` file or break UI into sub-components within the tool's folder.
- **All localStorage keys must be namespaced** with the tool slug: `abzar:kanban:columns`, `abzar:habit-tracker:habits`, etc.
- **No `alert()`, `confirm()`, or `prompt()`.** Use inline UI for all feedback and confirmation.

### Adding a New Tool (checklist)

1. Add entry to `lib/tools-registry.ts` with all metadata fields
2. Create `components/tools/[slug]/index.tsx` — the interactive component
3. Create `app/tools/[category]/[slug]/page.tsx` — thin wrapper with `ToolPage` + `dynamic` import
4. If the tool needs static data, add it to `public/data/` and fetch with a relative import
5. Test: desktop, mobile, dark mode, empty state, error state
6. Commit with message: `feat: add [tool-name] tool`
