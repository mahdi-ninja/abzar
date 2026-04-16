import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import {
  Space_Grotesk,
  Source_Serif_4,
  Source_Code_Pro,
  Vazirmatn,
  Noto_Naskh_Arabic,
} from "next/font/google";
import { routing } from "@/i18n/routing";
import { ThemeProvider } from "@/components/theme-provider";
import { PwaProvider } from "@/components/pwa-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { AppShell } from "@/components/layout/app-shell";
import { siteConfig } from "@/lib/config";
import "@/app/globals.css";

// English fonts (always loaded)
const spaceGrotesk = Space_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
});
const sourceSerif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
});
const sourceCodePro = Source_Code_Pro({
  variable: "--font-mono",
  subsets: ["latin"],
});

// Persian fonts (applied via CSS only when locale is fa)
const vazirmatn = Vazirmatn({
  variable: "--font-sans-fa",
  subsets: ["arabic"],
});
const notoNaskhArabic = Noto_Naskh_Arabic({
  variable: "--font-serif-fa",
  subsets: ["arabic"],
});

const rtlLocales = ["fa", "ar", "he"];

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: `${siteConfig.name} — ${siteConfig.tagline}`,
      template: `%s — ${siteConfig.name}`,
    },
    description: siteConfig.description,
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

export default async function RootLayout({
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
  const dir = rtlLocales.includes(locale) ? "rtl" : "ltr";
  const fontVars =
    locale === "fa"
      ? `${vazirmatn.variable} ${notoNaskhArabic.variable} ${sourceCodePro.variable}`
      : `${spaceGrotesk.variable} ${sourceSerif.variable} ${sourceCodePro.variable}`;

  return (
    <html
      lang={locale}
      dir={dir}
      suppressHydrationWarning
      className={`${fontVars} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("abzar:theme");var d=document.documentElement;d.classList.remove("light","dark");if(t==="dark")d.classList.add("dark");else if(t==="light")d.classList.add("light");else if(window.matchMedia("(prefers-color-scheme:dark)").matches)d.classList.add("dark");else d.classList.add("light")}catch(e){}})()`,
          }}
        />
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
