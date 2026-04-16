@AGENTS.md
@README.md

# AI Rules

## Architectural Rules

1. **Never import tool components into shared code.** Registry is pure metadata.
2. **Every tool uses `next/dynamic`** in the tool page route.
3. **Heavy deps (>20KB) load on user action**, not on mount.
4. **No `alert()`, `confirm()`, `prompt()`.** Use inline UI and Sonner toasts.
5. **All localStorage keys namespaced** as `abzar:{tool-slug}:{key}`. Always wrap in try/catch.
6. **Keep tool components under 300 lines.** Extract to `utils.ts` if needed.
7. **No barrel files.** Each tool imported individually at its route.
8. **No dangerouslySetInnerHTML** unless absolutely necessary (markdown preview is the one exception — sanitize with DOMPurify).
9. **Don't commit** unless the user explicitly says to.
10. **All branding** (name, URL, tagline) comes from `lib/config.ts` — never hardcode.
11. **Run `npm run check`** (lint + tests) after making changes. Fix all lint errors properly — do not use `eslint-disable` comments as a workaround if there's a clean way of fixing it. Resolve the root cause instead (move impure calls outside components, use state initializers instead of effects, etc.).

When implementing a planned tool, read its detailed spec from `ABZAR_SPEC.md`.

## Gotchas

- shadcn/ui v4 uses **Base UI, not Radix**. `SheetTrigger`/`DialogTrigger` use `render={<Component />}` instead of `asChild`. `Select.onValueChange` can pass `null` — guard with `(v) => v && set(v)`. `Slider.onValueChange` returns `number | readonly number[]` — use `Array.isArray(v) ? v[0] : v`.
- `SelectValue` may not display correctly for dynamic items — render the label explicitly in `SelectTrigger` instead: `<SelectTrigger><span>{label}</span></SelectTrigger>`.
- Theme is custom (no `next-themes`). Provider at `components/theme-provider.tsx`. Import `useTheme` from there, not from any package.
- JSON-LD goes in `generateMetadata`'s `other` field, not inline `<script>` tags (causes hydration errors).
- Static export requires `generateStaticParams` for all dynamic routes — and every `generateStaticParams` must cross-product with `routing.locales` (see `i18n/routing.ts`).

## i18n Gotchas

- **Navigation imports**: Use `Link`, `useRouter`, `usePathname`, `redirect` from `@/i18n/navigation` — never from `next/link` or `next/navigation` directly (except `notFound` which stays from `next/navigation`).
- **`setRequestLocale(locale)`** must be called in every server page and layout for static export to work. Without it, `next-intl` falls back to `headers()` which breaks `output: 'export'`.
- **`useTranslations`** is for sync components (client or sync server). **`getTranslations`** (from `next-intl/server`) is for `async` server components. Using `useTranslations` in an async component will error.
- **Checking optional translation keys**: Use `t.has('key')` before accessing — not all tools have entries in every message namespace.
- **Directional CSS**: Use Tailwind logical properties (`ms-*`, `me-*`, `ps-*`, `pe-*`, `text-start`, `text-end`, `inset-s-*`, `inset-e-*`, `border-s`, `border-e`) instead of physical (`ml-*`, `mr-*`, `pl-*`, `pr-*`, `text-left`, `text-right`, `left-*`, `right-*`, `border-l`, `border-r`). Exception: centering patterns (`left-1/2 -translate-x-1/2`) and animations stay physical.
- **`localePrefix: 'always'`** — all URLs require `/en` or `/fa` prefix. The root `/` redirects to `/en` via `app/page.tsx`.

## React 19 Patterns

React 19's strict lint rules (`react-hooks/set-state-in-effect`, `react-hooks/purity`) require these patterns:

- **Reading localStorage on mount:** Use `useState(() => readFromStorage())`, not `useEffect` + `setState`.
- **Impure functions** (`Date.now()`, `Math.random()`): Keep outside the component body — in module-level functions, event handlers, or `useMemo` with a seed counter.
- **Deriving state from params:** Prefer `useMemo` over `useEffect` + `setState`. If you need a manual refresh trigger, add a `seed` counter to `useMemo` deps and increment it in the event handler.
- **Recursive setTimeout:** Store the timer ID in a ref (`timerRef.current = setTimeout(tick, ms)`) so cleanup can cancel the latest one, not just the first.
- **AudioContext:** Create once in a ref, call `.resume()` on user gesture (required by browsers), `.close()` on unmount.
