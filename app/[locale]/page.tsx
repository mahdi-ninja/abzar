import { Link } from "@/i18n/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { categories } from "@/lib/categories";
import { getToolsByCategory, getFeaturedTools } from "@/lib/tools-registry";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { HomeSearch } from "@/components/home-search";
import { siteConfig } from "@/lib/config";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const featured = getFeaturedTools();
  const t = await getTranslations("home");
  const tCat = await getTranslations("categories");
  const tTools = await getTranslations("tools");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero */}
      <section className="py-8 text-center sm:py-12">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
          {siteConfig.tagline}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground sm:text-lg">
          {siteConfig.subtitle}
        </p>

        <div className="mx-auto mt-6 max-w-md">
          <HomeSearch />
        </div>

        {/* Quick filter pills */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {["JSON", "Password", "Color", "PDF", "Calculator", "Image", "UUID"].map(
            (tag) => (
              <Badge key={tag} variant="secondary" className="cursor-default">
                {tag}
              </Badge>
            )
          )}
        </div>
      </section>

      {/* Category Grid */}
      <section className="py-6">
        <h2 className="mb-4 text-xl font-semibold">{t("categories")}</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((cat) => {
            const toolCount = getToolsByCategory(cat.slug).length;
            return (
              <Link key={cat.slug} href={`/tools/${cat.slug}`}>
                <Card className="h-full transition-colors hover:bg-accent py-3 px-4 gap-1">
                  <CardHeader className="p-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{cat.icon}</span>
                      <CardTitle className="text-sm font-semibold">
                        {tCat(`${cat.slug}.name`)}
                      </CardTitle>
                    </div>
                    <CardDescription className="text-xs mt-1">
                      {tCat(`${cat.slug}.description`)}
                    </CardDescription>
                  </CardHeader>
                  <div className="px-0 pt-1">
                    <span className="text-xs text-muted-foreground">
                      {toolCount} {t("toolsSuffix")}
                    </span>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Tools */}
      <section className="py-6">
        <h2 className="mb-4 text-xl font-semibold">{t("popularTools")}</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((tool) => {
            const catSlug = tool.category;
            const catIcon = categories.find((c) => c.slug === catSlug)?.icon;

            return (
              <Link
                key={tool.slug}
                href={`/tools/${tool.category}/${tool.slug}`}
              >
                <Card className="h-full transition-colors hover:bg-accent py-3 px-4 gap-1">
                  <CardHeader className="p-0">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{catIcon}</span>
                      <CardTitle className="text-sm font-semibold">
                        {tTools(`${tool.slug}.name`)}
                      </CardTitle>
                      {tool.isNew && (
                        <Badge className="text-[10px] px-1.5 py-0">
                          {t("newBadge")}
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-xs mt-1">
                      {tTools(`${tool.slug}.description`)}
                    </CardDescription>
                  </CardHeader>
                  <div className="px-0 pt-1">
                    <Badge variant="outline" className="text-[10px]">
                      {tCat(`${catSlug}.name`)}
                    </Badge>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
