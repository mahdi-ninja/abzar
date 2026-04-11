import Link from "next/link";
import { getCategoryBySlug } from "@/lib/categories";

interface BreadcrumbsProps {
  category: string;
  toolName?: string;
}

export function Breadcrumbs({ category, toolName }: BreadcrumbsProps) {
  const cat = getCategoryBySlug(category);

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-2 text-sm text-muted-foreground"
    >
      <Link href="/" className="hover:text-foreground transition-colors">
        Home
      </Link>
      <span>/</span>
      {toolName ? (
        <>
          <Link
            href={`/tools/${category}`}
            className="hover:text-foreground transition-colors"
          >
            {cat?.name ?? category}
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium truncate">
            {toolName}
          </span>
        </>
      ) : (
        <span className="text-foreground font-medium">
          {cat?.name ?? category}
        </span>
      )}
    </nav>
  );
}
