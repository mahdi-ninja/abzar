import { defineRouting } from 'next-intl/routing';

export const locales = ['en', 'fa', 'zh', 'es'] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: 'en',
  localePrefix: 'always',
});
