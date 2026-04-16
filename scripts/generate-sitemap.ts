import { tools, isToolAccessible } from '../lib/tools-registry';
import { categories } from '../lib/categories';
import { locales, routing } from '../i18n/routing';
import { siteConfig } from '../lib/config';
import { writeFileSync } from 'fs';

const baseUrl = siteConfig.url;
const today = new Date().toISOString().split('T')[0];

function urlForLocale(path: string, locale: string): string {
  return `${baseUrl}/${locale}${path}`;
}

function alternateLinks(path: string): string {
  return locales
    .map(
      (l) =>
        `    <xhtml:link rel="alternate" hreflang="${l}" href="${urlForLocale(path, l)}" />`
    )
    .concat([
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${urlForLocale(path, routing.defaultLocale)}" />`,
    ])
    .join('\n');
}

function urlEntry(path: string, priority: string, changefreq: string): string {
  return locales
    .map(
      (l) => `  <url>
    <loc>${urlForLocale(path, l)}</loc>
${alternateLinks(path)}
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
    )
    .join('\n');
}

const liveTools = tools.filter(
  (t) => isToolAccessible(t) || t.status === 'beta'
);

const entries: string[] = [];

// Homepage
entries.push(urlEntry('/', '1.0', 'daily'));

// Category pages
for (const cat of categories) {
  entries.push(urlEntry(`/tools/${cat.slug}`, '0.8', 'weekly'));
}

// Tool pages
for (const tool of liveTools) {
  entries.push(
    urlEntry(`/tools/${tool.category}/${tool.slug}`, '0.7', 'monthly')
  );
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>
`;

writeFileSync('public/sitemap.xml', sitemap);
console.log(
  `Generated public/sitemap.xml (${locales.length} locales, ${liveTools.length} tools, ${categories.length} categories)`
);
