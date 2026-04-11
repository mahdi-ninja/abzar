import Link from "next/link";
import { notFound } from "next/navigation";
import { categories, getCategoryBySlug } from "@/lib/categories";
import { getToolsByCategory, isToolAccessible } from "@/lib/tools-registry";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function generateStaticParams() {
  return categories.map((cat) => ({ category: cat.slug }));
}

export function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  // Next.js 15+ passes params as a Promise in static generation
  // but generateMetadata receives resolved params
  return params.then(({ category }) => {
    const cat = getCategoryBySlug(category);
    if (!cat) return {};
    return {
      title: `${cat.name} Tools`,
      description: cat.description,
    };
  });
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = getCategoryBySlug(category);
  if (!cat) notFound();

  const tools = getToolsByCategory(category);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <span>/</span>
          <span>{cat.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{cat.icon}</span>
          <div>
            <h1 className="text-2xl font-bold">{cat.name}</h1>
            <p className="text-muted-foreground">{cat.description}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => {
          const accessible = isToolAccessible(tool);

          if (accessible) {
            return (
              <Link
                key={tool.slug}
                href={`/tools/${tool.category}/${tool.slug}`}
              >
                <Card className="h-full transition-colors hover:bg-accent py-3 px-4 gap-1">
                  <CardHeader className="p-0">
                    <CardTitle className="text-sm font-semibold">
                      {tool.name}
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {tool.description}
                    </CardDescription>
                  </CardHeader>
                  <div className="flex gap-1.5 px-0 pt-1">
                    {tool.status === "beta" && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        Beta
                      </Badge>
                    )}
                    {tool.isNew && (
                      <Badge className="text-[10px] px-1.5 py-0">New</Badge>
                    )}
                  </div>
                </Card>
              </Link>
            );
          }

          return (
            <Card
              key={tool.slug}
              className="h-full opacity-60 py-3 px-4 gap-1"
            >
              <CardHeader className="p-0">
                <CardTitle className="text-sm font-semibold">
                  {tool.name}
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  {tool.description}
                </CardDescription>
              </CardHeader>
              <div className="px-0 pt-1">
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  Coming Soon
                </Badge>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
