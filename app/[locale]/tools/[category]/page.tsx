import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { routing } from "@/i18n/routing";
import { categories, getCategoryBySlug } from "@/lib/categories";
import { getToolsByCategory, isToolAccessible } from "@/lib/tools-registry";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    categories.map((cat) => ({ locale, category: cat.slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}) {
  const { locale, category } = await params;
  const cat = getCategoryBySlug(category);
  if (!cat) return {};
  const t = await getTranslations({ locale, namespace: "categories" });
  return {
    title: t(`${category}.name`),
    description: t(`${category}.description`),
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `/${l}/tools/${category}`])
      ),
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}) {
  const { locale, category } = await params;
  setRequestLocale(locale);
  const cat = getCategoryBySlug(category);
  if (!cat) notFound();

  const tools = getToolsByCategory(category);
  const activeTools = tools.filter((t) => isToolAccessible(t));
  const plannedTools = tools.filter((t) => !isToolAccessible(t));

  return <CategoryPageContent category={category} cat={cat} activeTools={activeTools} plannedTools={plannedTools} />;
}

function CategoryPageContent({
  category,
  cat,
  activeTools,
  plannedTools,
}: {
  category: string;
  cat: { icon: string };
  activeTools: ReturnType<typeof getToolsByCategory>;
  plannedTools: ReturnType<typeof getToolsByCategory>;
}) {
  const t = useTranslations("categoryPage");
  const tBread = useTranslations("breadcrumbs");
  const tCat = useTranslations("categories");
  const tTools = useTranslations("tools");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link href="/" className="hover:text-foreground">
            {tBread("home")}
          </Link>
          <span>/</span>
          <span>{tCat(`${category}.name`)}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{cat.icon}</span>
          <div>
            <h1 className="text-2xl font-bold">{tCat(`${category}.name`)}</h1>
            <p className="text-muted-foreground">
              {tCat(`${category}.description`)}
            </p>
          </div>
        </div>
      </div>

      {/* Active tools */}
      {activeTools.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {activeTools.map((tool) => (
            <Link
              key={tool.slug}
              href={`/tools/${tool.category}/${tool.slug}`}
            >
              <Card className="h-full transition-colors hover:bg-accent py-3 px-4 gap-1">
                <CardHeader className="p-0">
                  <CardTitle className="text-sm font-semibold">
                    {tTools(`${tool.slug}.name`)}
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    {tTools(`${tool.slug}.description`)}
                  </CardDescription>
                </CardHeader>
                <div className="flex gap-1.5 px-0 pt-1">
                  {tool.status === "beta" && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0"
                    >
                      {t("betaBadge")}
                    </Badge>
                  )}
                  {tool.isNew && (
                    <Badge className="text-[10px] px-1.5 py-0">
                      {t("newBadge")}
                    </Badge>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Separator */}
      {activeTools.length > 0 && plannedTools.length > 0 && (
        <div className="flex items-center gap-3 my-6">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground shrink-0">
            {t("comingSoon")}
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>
      )}

      {/* Planned tools */}
      {plannedTools.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {plannedTools.map((tool) => (
            <Card
              key={tool.slug}
              className="h-full opacity-50 py-3 px-4 gap-1"
            >
              <CardHeader className="p-0">
                <CardTitle className="text-sm font-semibold">
                  {tTools(`${tool.slug}.name`)}
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  {tTools(`${tool.slug}.description`)}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
