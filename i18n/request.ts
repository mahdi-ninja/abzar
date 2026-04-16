import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { routing } from './routing';

function loadToolMessages(locale: string): Record<string, unknown> {
  const dir = join(process.cwd(), 'messages', locale, 'tool');
  let files: string[];
  try {
    files = readdirSync(dir).filter((f) => f.endsWith('.json'));
  } catch {
    return {};
  }
  const merged: Record<string, unknown> = {};
  for (const file of files) {
    const content = JSON.parse(readFileSync(join(dir, file), 'utf-8'));
    Object.assign(merged, content);
  }
  return merged;
}

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
      ...loadToolMessages(locale!),
    },
  };
});
