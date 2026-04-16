import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { ToolPage } from "@/components/layout/tool-page";
import { ToolSkeleton } from "@/components/layout/tool-skeleton";
import {
  tools,
  getToolBySlug,
  isToolAccessible,
} from "@/lib/tools-registry";
import { generateToolJsonLd } from "@/lib/json-ld";


export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    tools.map((t) => ({
      locale,
      category: t.category,
      "tool-slug": t.slug,
    }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{
    locale: string;
    category: string;
    "tool-slug": string;
  }>;
}) {
  const { locale, "tool-slug": slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) return {};
  const t = await getTranslations({ locale, namespace: "tools" });
  const tSite = await getTranslations({ locale, namespace: "site" });
  const toolName = t(`${slug}.name`);
  const toolDesc = t(`${slug}.description`);
  const titleSuffix = tSite("titleSuffix");
  return {
    title: `${toolName} — ${titleSuffix}`,
    description: toolDesc,
    openGraph: {
      title: `${toolName} — ${titleSuffix} | ${tSite("name")}`,
      description: toolDesc,
      images: [`/og/${locale}/${tool.category}/${tool.slug}.png`],
    },
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((l) => [
          l,
          `/${l}/tools/${tool.category}/${tool.slug}`,
        ])
      ),
    },
    other: {
      "script:ld+json": JSON.stringify(
        generateToolJsonLd(tool, locale, { name: toolName, description: toolDesc })
      ),
    },
  };
}

// Dynamic tool component map — only import implemented tools
const toolComponents: Record<string, ReturnType<typeof dynamic>> = {
  "json-formatter": dynamic(
    () => import("@/components/tools/json-formatter"),
    { loading: () => <ToolSkeleton /> }
  ),
  base64: dynamic(() => import("@/components/tools/base64"), {
    loading: () => <ToolSkeleton />,
  }),
  "color-picker": dynamic(
    () => import("@/components/tools/color-picker"),
    { loading: () => <ToolSkeleton /> }
  ),
  "password-generator": dynamic(
    () => import("@/components/tools/password-generator"),
    { loading: () => <ToolSkeleton /> }
  ),
  "uuid-generator": dynamic(
    () => import("@/components/tools/uuid-generator"),
    { loading: () => <ToolSkeleton /> }
  ),
  "word-counter": dynamic(
    () => import("@/components/tools/word-counter"),
    { loading: () => <ToolSkeleton /> }
  ),
  "unit-converter": dynamic(
    () => import("@/components/tools/unit-converter"),
    { loading: () => <ToolSkeleton /> }
  ),
  "timestamp-converter": dynamic(
    () => import("@/components/tools/timestamp-converter"),
    { loading: () => <ToolSkeleton /> }
  ),
  "hash-generator": dynamic(
    () => import("@/components/tools/hash-generator"),
    { loading: () => <ToolSkeleton /> }
  ),
  "qr-generator": dynamic(
    () => import("@/components/tools/qr-generator"),
    { loading: () => <ToolSkeleton /> }
  ),
  // Phase 2
  "regex-tester": dynamic(
    () => import("@/components/tools/regex-tester"),
    { loading: () => <ToolSkeleton /> }
  ),
  "image-resizer": dynamic(
    () => import("@/components/tools/image-resizer"),
    { loading: () => <ToolSkeleton /> }
  ),
  "gradient-generator": dynamic(
    () => import("@/components/tools/gradient-generator"),
    { loading: () => <ToolSkeleton /> }
  ),
  "markdown-editor": dynamic(
    () => import("@/components/tools/markdown-editor"),
    { loading: () => <ToolSkeleton /> }
  ),
  "mortgage-calculator": dynamic(
    () => import("@/components/tools/mortgage-calculator"),
    { loading: () => <ToolSkeleton /> }
  ),
  pomodoro: dynamic(
    () => import("@/components/tools/pomodoro"),
    { loading: () => <ToolSkeleton /> }
  ),
  "subnet-calculator": dynamic(
    () => import("@/components/tools/subnet-calculator"),
    { loading: () => <ToolSkeleton /> }
  ),
  "jwt-decoder": dynamic(
    () => import("@/components/tools/jwt-decoder"),
    { loading: () => <ToolSkeleton /> }
  ),
  "cron-builder": dynamic(
    () => import("@/components/tools/cron-builder"),
    { loading: () => <ToolSkeleton /> }
  ),
  "contrast-checker": dynamic(
    () => import("@/components/tools/contrast-checker"),
    { loading: () => <ToolSkeleton /> }
  ),
  // Phase 3
  "typing-test": dynamic(
    () => import("@/components/tools/typing-test"),
    { loading: () => <ToolSkeleton /> }
  ),
  kanban: dynamic(
    () => import("@/components/tools/kanban"),
    { loading: () => <ToolSkeleton /> }
  ),
  flashcards: dynamic(
    () => import("@/components/tools/flashcards"),
    { loading: () => <ToolSkeleton /> }
  ),
  "pixel-art": dynamic(
    () => import("@/components/tools/pixel-art"),
    { loading: () => <ToolSkeleton /> }
  ),
  "drum-machine": dynamic(
    () => import("@/components/tools/drum-machine"),
    { loading: () => <ToolSkeleton /> }
  ),
  "game-of-life": dynamic(
    () => import("@/components/tools/game-of-life"),
    { loading: () => <ToolSkeleton /> }
  ),
  "algorithm-visualizer": dynamic(
    () => import("@/components/tools/algorithm-visualizer"),
    { loading: () => <ToolSkeleton /> }
  ),
  "habit-tracker": dynamic(
    () => import("@/components/tools/habit-tracker"),
    { loading: () => <ToolSkeleton /> }
  ),
  "invoice-generator": dynamic(
    () => import("@/components/tools/invoice-generator"),
    { loading: () => <ToolSkeleton /> }
  ),
  "pdf-merger": dynamic(
    () => import("@/components/tools/pdf-merger"),
    { loading: () => <ToolSkeleton /> }
  ),
  // Phase 4 — batch of easy light-dep tools
  "lorem-ipsum": dynamic(() => import("@/components/tools/lorem-ipsum"), { loading: () => <ToolSkeleton /> }),
  "case-converter": dynamic(() => import("@/components/tools/case-converter"), { loading: () => <ToolSkeleton /> }),
  "slug-generator": dynamic(() => import("@/components/tools/slug-generator"), { loading: () => <ToolSkeleton /> }),
  "string-escaper": dynamic(() => import("@/components/tools/string-escaper"), { loading: () => <ToolSkeleton /> }),
  "reverse-text": dynamic(() => import("@/components/tools/reverse-text"), { loading: () => <ToolSkeleton /> }),
  "whitespace-cleaner": dynamic(() => import("@/components/tools/whitespace-cleaner"), { loading: () => <ToolSkeleton /> }),
  "url-encoder": dynamic(() => import("@/components/tools/url-encoder"), { loading: () => <ToolSkeleton /> }),
  "html-entities": dynamic(() => import("@/components/tools/html-entities"), { loading: () => <ToolSkeleton /> }),
  "chmod-calculator": dynamic(() => import("@/components/tools/chmod-calculator"), { loading: () => <ToolSkeleton /> }),
  "epoch-countdown": dynamic(() => import("@/components/tools/epoch-countdown"), { loading: () => <ToolSkeleton /> }),
  "percentage-calculator": dynamic(() => import("@/components/tools/percentage-calculator"), { loading: () => <ToolSkeleton /> }),
  "number-base-converter": dynamic(() => import("@/components/tools/number-base-converter"), { loading: () => <ToolSkeleton /> }),
  "roman-numerals": dynamic(() => import("@/components/tools/roman-numerals"), { loading: () => <ToolSkeleton /> }),
  "data-size-converter": dynamic(() => import("@/components/tools/data-size-converter"), { loading: () => <ToolSkeleton /> }),
  "aspect-ratio": dynamic(() => import("@/components/tools/aspect-ratio"), { loading: () => <ToolSkeleton /> }),
  "random-generator": dynamic(() => import("@/components/tools/random-generator"), { loading: () => <ToolSkeleton /> }),
  "tip-calculator": dynamic(() => import("@/components/tools/tip-calculator"), { loading: () => <ToolSkeleton /> }),
  "salary-converter": dynamic(() => import("@/components/tools/salary-converter"), { loading: () => <ToolSkeleton /> }),
  "roi-calculator": dynamic(() => import("@/components/tools/roi-calculator"), { loading: () => <ToolSkeleton /> }),
  "markup-margin": dynamic(() => import("@/components/tools/markup-margin"), { loading: () => <ToolSkeleton /> }),
  "date-difference": dynamic(() => import("@/components/tools/date-difference"), { loading: () => <ToolSkeleton /> }),
  "age-calculator": dynamic(() => import("@/components/tools/age-calculator"), { loading: () => <ToolSkeleton /> }),
  "bmi-calculator": dynamic(() => import("@/components/tools/bmi-calculator"), { loading: () => <ToolSkeleton /> }),
  "sleep-calculator": dynamic(() => import("@/components/tools/sleep-calculator"), { loading: () => <ToolSkeleton /> }),
  stopwatch: dynamic(() => import("@/components/tools/stopwatch"), { loading: () => <ToolSkeleton /> }),
  countdown: dynamic(() => import("@/components/tools/countdown"), { loading: () => <ToolSkeleton /> }),
  notepad: dynamic(() => import("@/components/tools/notepad"), { loading: () => <ToolSkeleton /> }),
  "reading-time": dynamic(() => import("@/components/tools/reading-time"), { loading: () => <ToolSkeleton /> }),
  "dice-roller": dynamic(() => import("@/components/tools/dice-roller"), { loading: () => <ToolSkeleton /> }),
  "magic-8-ball": dynamic(() => import("@/components/tools/magic-8-ball"), { loading: () => <ToolSkeleton /> }),
  "random-bytes": dynamic(() => import("@/components/tools/random-bytes"), { loading: () => <ToolSkeleton /> }),
  "hmac-generator": dynamic(() => import("@/components/tools/hmac-generator"), { loading: () => <ToolSkeleton /> }),
  "json-to-csv": dynamic(() => import("@/components/tools/json-to-csv"), { loading: () => <ToolSkeleton /> }),
  "html-to-markdown": dynamic(() => import("@/components/tools/html-to-markdown"), { loading: () => <ToolSkeleton /> }),
  "markdown-to-html": dynamic(() => import("@/components/tools/markdown-to-html"), { loading: () => <ToolSkeleton /> }),
  // Phase 5 — Fun & Creative
  "generative-art": dynamic(() => import("@/components/tools/generative-art"), { loading: () => <ToolSkeleton /> }),
  "meme-generator": dynamic(() => import("@/components/tools/meme-generator"), { loading: () => <ToolSkeleton /> }),
  soundboard: dynamic(() => import("@/components/tools/soundboard"), { loading: () => <ToolSkeleton /> }),
  "terrain-generator": dynamic(() => import("@/components/tools/terrain-generator"), { loading: () => <ToolSkeleton /> }),
  "drawing-canvas": dynamic(() => import("@/components/tools/drawing-canvas"), { loading: () => <ToolSkeleton /> }),
  "ambient-sounds": dynamic(() => import("@/components/tools/ambient-sounds"), { loading: () => <ToolSkeleton /> }),
  "css-art": dynamic(() => import("@/components/tools/css-art"), { loading: () => <ToolSkeleton /> }),
  "emoji-search": dynamic(() => import("@/components/tools/emoji-search"), { loading: () => <ToolSkeleton /> }),
  "palette-game": dynamic(() => import("@/components/tools/palette-game"), { loading: () => <ToolSkeleton /> }),
};

export default async function ToolSlugPage({
  params,
}: {
  params: Promise<{
    locale: string;
    category: string;
    "tool-slug": string;
  }>;
}) {
  const { locale, "tool-slug": slug } = await params;
  setRequestLocale(locale);
  const tool = getToolBySlug(slug);
  if (!tool) notFound();

  const t = await getTranslations({ locale, namespace: "tools" });
  const tContent = await getTranslations({ locale, namespace: "toolContent" });
  const tPage = await getTranslations({ locale, namespace: "toolPage" });

  const toolName = t(`${slug}.name`);
  const toolDesc = t(`${slug}.description`);

  // Get translated about/howTo if this tool has content entries
  let about: string | undefined;
  let howTo: string[] | undefined;
  if (tContent.has(`${slug}.about`)) {
    about = tContent(`${slug}.about`);
  }
  if (tContent.has(`${slug}.howTo`)) {
    const howToRaw = tContent.raw(`${slug}.howTo`);
    howTo = Array.isArray(howToRaw) ? howToRaw : undefined;
  }

  const ToolComponent = toolComponents[slug];
  const accessible = isToolAccessible(tool);

  // Global messages for the NextIntlClientProvider
  // Per-tool messages (messages/{locale}/tool/{slug}.json) can be merged here
  // once individual tool translation files are created.
  const mergedMessages = await getMessages();

  return (
    <NextIntlClientProvider messages={mergedMessages}>
      <ToolPage tool={tool} toolName={toolName} toolDesc={toolDesc} about={about} howTo={howTo}>
        {accessible && ToolComponent ? (
          <ToolComponent />
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 p-12 text-center">
            <p className="text-lg font-medium text-muted-foreground">
              {tPage("comingSoonTitle")}
            </p>
            <p className="mt-1 text-sm text-muted-foreground/70">
              {tPage("comingSoonDesc")}
            </p>
          </div>
        )}
      </ToolPage>
    </NextIntlClientProvider>
  );
}
