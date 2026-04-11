import { writeFileSync } from "fs";
import { categories } from "../lib/categories";
import { getVisibleTools } from "../lib/tools-registry";
import { siteConfig } from "../lib/config";

const BASE_URL = siteConfig.url;

function generateSitemap(): string {
  const now = new Date().toISOString().split("T")[0];

  const urls: string[] = [];

  // Homepage
  urls.push(`  <url>
    <loc>${BASE_URL}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>`);

  // Category pages
  for (const cat of categories) {
    urls.push(`  <url>
    <loc>${BASE_URL}/tools/${cat.slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
  }

  // Tool pages
  for (const tool of getVisibleTools()) {
    urls.push(`  <url>
    <loc>${BASE_URL}/tools/${tool.category}/${tool.slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`);
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;
}

const sitemap = generateSitemap();
writeFileSync("public/sitemap.xml", sitemap, "utf-8");
console.log(
  `Generated sitemap.xml with ${sitemap.split("<url>").length - 1} URLs`
);
