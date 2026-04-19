import {
  Noto_Naskh_Arabic,
  Noto_Sans_SC,
  Source_Code_Pro,
  Source_Serif_4,
  Space_Grotesk,
  Vazirmatn,
} from "next/font/google";

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

const vazirmatn = Vazirmatn({
  variable: "--font-sans-fa",
  subsets: ["arabic"],
});

const notoNaskhArabic = Noto_Naskh_Arabic({
  variable: "--font-serif-fa",
  subsets: ["arabic"],
});

const notoSansSC = Noto_Sans_SC({
  variable: "--font-sans-zh",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const rtlLocales = new Set(["fa", "ar", "he"]);

export function isRtlLocale(locale: string) {
  return rtlLocales.has(locale);
}

export function getLocaleDir(locale: string): "ltr" | "rtl" {
  return isRtlLocale(locale) ? "rtl" : "ltr";
}

export function getLocaleFontVars(locale: string) {
  // These variables are loaded onto <html> and then remapped to the shared
  // --font-sans/--font-serif/--font-mono tokens in app/globals.css.
  switch (locale) {
    case "fa":
      return `${vazirmatn.variable} ${notoNaskhArabic.variable} ${sourceCodePro.variable}`;
    case "zh":
      return `${notoSansSC.variable} ${sourceSerif.variable} ${sourceCodePro.variable}`;
    default:
      return `${spaceGrotesk.variable} ${sourceSerif.variable} ${sourceCodePro.variable}`;
  }
}
