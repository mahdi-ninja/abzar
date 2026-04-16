import type { Tool } from "./tools-registry";
import { siteConfig } from "./config";

export function generateToolJsonLd(
  tool: Tool,
  overrides?: { name: string; description: string }
) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: overrides?.name ?? tool.name,
    description: overrides?.description ?? tool.description,
    url: `${siteConfig.url}/tools/${tool.category}/${tool.slug}`,
    applicationCategory: "UtilityApplication",
    operatingSystem: "Any",
    browserRequirements:
      "Requires JavaScript. Works in Chrome, Firefox, Safari, Edge.",
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
    inLanguage: "en",
    isAccessibleForFree: true,
    featureList: tool.tags.join(", "),
  };
}
