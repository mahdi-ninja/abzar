import { hasLocale } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import "@/app/globals.css";

import { routing } from "@/i18n/routing";
import { SiteRoot } from "@/components/layout/site-root";
import { ThemeScript } from "@/components/theme-script";
import { siteConfig } from "@/lib/config";
import { getLocaleDir, getLocaleFontVars } from "@/lib/locale-config";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "site" });
  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: `${t("name")} — ${t("tagline")}`,
      template: `%s — ${t("name")}`,
    },
    description: t("description"),
    icons: {
      icon: [
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      ],
      apple: "/apple-touch-icon.png",
    },
    manifest: `/manifest.${locale}.json`,
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((l) => [
          l,
          `/${l}`,
        ])
      ),
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const messages = await getMessages();
  const dir = getLocaleDir(locale);
  const fontVars = getLocaleFontVars(locale);

  return (
    <html
      lang={locale}
      dir={dir}
      suppressHydrationWarning
      className={`${fontVars} h-full antialiased`}
    >
      <body className="min-h-full font-sans">
        <ThemeScript />
        <SiteRoot messages={messages}>{children}</SiteRoot>
      </body>
    </html>
  );
}
