import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { ToolPage } from "@/components/layout/tool-page";
import { ToolSkeleton } from "@/components/layout/tool-skeleton";
import { tools, getToolBySlug, isToolAccessible } from "@/lib/tools-registry";
import { getToolContent } from "@/lib/tool-content";
import { generateToolJsonLd } from "@/lib/json-ld";
import { siteConfig } from "@/lib/config";

export function generateStaticParams() {
  return tools.map((t) => ({
    category: t.category,
    "tool-slug": t.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; "tool-slug": string }>;
}) {
  const { "tool-slug": slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) return {};
  return {
    title: `${tool.name} — ${siteConfig.titleSuffix}`,
    description: tool.description,
    openGraph: {
      title: `${tool.name} — ${siteConfig.titleSuffix} | ${siteConfig.name}`,
      description: tool.description,
      images: [`/og/${tool.category}/${tool.slug}.png`],
    },
  };
}

// Dynamic tool component map — only import implemented tools
const toolComponents: Record<
  string,
  ReturnType<typeof dynamic>
> = {
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
  "pomodoro": dynamic(
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
  "kanban": dynamic(
    () => import("@/components/tools/kanban"),
    { loading: () => <ToolSkeleton /> }
  ),
  "flashcards": dynamic(
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
};

export default async function ToolSlugPage({
  params,
}: {
  params: Promise<{ category: string; "tool-slug": string }>;
}) {
  const { "tool-slug": slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) notFound();

  const content = getToolContent(slug);
  const ToolComponent = toolComponents[slug];
  const accessible = isToolAccessible(tool);

  const jsonLd = JSON.stringify(generateToolJsonLd(tool));

  return (
    <>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd }}
        />
      </head>
      <ToolPage
        tool={tool}
        about={content?.about}
        howTo={content?.howTo}
      >
        {accessible && ToolComponent ? (
          <ToolComponent />
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 p-12 text-center">
            <p className="text-lg font-medium text-muted-foreground">
              Coming Soon
            </p>
            <p className="mt-1 text-sm text-muted-foreground/70">
              This tool is currently under development.
            </p>
          </div>
        )}
      </ToolPage>
    </>
  );
}
