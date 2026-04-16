import type { Tool } from "./tools-registry";
import { siteConfig } from "./config";

const browserRequirements: Record<string, string> = {
  en: "Requires JavaScript. Works in Chrome, Firefox, Safari, Edge.",
  fa: "نیاز به جاوااسکریپت دارد. در Chrome، Firefox، Safari و Edge کار می‌کند.",
};

export function generateToolJsonLd(
  tool: Tool,
  locale: string,
  overrides?: { name: string; description: string }
) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: overrides?.name ?? tool.name,
    description: overrides?.description ?? tool.description,
    url: `${siteConfig.url}/${locale}/tools/${tool.category}/${tool.slug}`,
    applicationCategory: "UtilityApplication",
    operatingSystem: "Any",
    browserRequirements: browserRequirements[locale] ?? browserRequirements.en,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    creator: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    inLanguage: locale,
    isAccessibleForFree: true,
    featureList: tool.tags.join(", "),
  };
}
