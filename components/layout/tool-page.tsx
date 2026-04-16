import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ToolErrorBoundary } from "@/components/layout/tool-error-boundary";
import { getToolBySlug, isToolAccessible, type Tool } from "@/lib/tools-registry";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface ToolPageProps {
  tool: Tool;
  toolName?: string;
  toolDesc?: string;
  children: React.ReactNode;
  about?: string;
  howTo?: string[];
}

export function ToolPage({ tool, toolName, toolDesc, children, about, howTo }: ToolPageProps) {
  const t = useTranslations("toolPage");
  const tTools = useTranslations("tools");
  const tCat = useTranslations("categories");

  const displayName = toolName ?? tool.name;
  const displayDesc = toolDesc ?? tool.description;

  const relatedTools = (tool.related ?? [])
    .map((slug) => getToolBySlug(slug))
    .filter((t): t is Tool => t != null && isToolAccessible(t))
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <Breadcrumbs category={tool.category} toolName={displayName} />

      <h1 className="mt-3 text-2xl font-bold">{displayName}</h1>
      <p className="mt-1 text-muted-foreground">{displayDesc}</p>

      {/* Tool widget */}
      <div className="mt-6">
        <ToolErrorBoundary toolSlug={tool.slug}>{children}</ToolErrorBoundary>
      </div>

      {/* About section */}
      {about && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold mb-2">{t("aboutHeading")}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {about}
          </p>
        </section>
      )}

      {/* How to use */}
      {howTo && howTo.length > 0 && (
        <section className="mt-6">
          <h2 className="text-lg font-semibold mb-2">{t("howToHeading")}</h2>
          <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
            {howTo.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </section>
      )}

      {/* Related tools */}
      {relatedTools.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold mb-3">{t("relatedHeading")}</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {relatedTools.map((rt) => (
              <Link
                key={rt.slug}
                href={`/tools/${rt.category}/${rt.slug}`}
              >
                <Card className="h-full transition-colors hover:bg-accent py-3 px-4 gap-1">
                  <CardHeader className="p-0">
                    <CardTitle className="text-sm font-semibold">
                      {tTools(`${rt.slug}.name`)}
                    </CardTitle>
                    <CardDescription className="text-xs mt-1 line-clamp-2">
                      {tTools(`${rt.slug}.description`)}
                    </CardDescription>
                  </CardHeader>
                  <div className="px-0 pt-1">
                    <Badge variant="outline" className="text-[10px]">
                      {tCat(`${rt.category}.name`)}
                    </Badge>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
