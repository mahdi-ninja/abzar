import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

interface BreadcrumbsProps {
  category: string;
  toolName?: string;
}

export function Breadcrumbs({ category, toolName }: BreadcrumbsProps) {
  const t = useTranslations("breadcrumbs");
  const tCat = useTranslations("categories");

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-2 text-sm text-muted-foreground"
    >
      <Link href="/" className="hover:text-foreground transition-colors">
        {t("home")}
      </Link>
      <span>/</span>
      {toolName ? (
        <>
          <Link
            href={`/tools/${category}`}
            className="hover:text-foreground transition-colors"
          >
            {tCat(`${category}.name`)}
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium truncate">
            {toolName}
          </span>
        </>
      ) : (
        <span className="text-foreground font-medium">
          {tCat(`${category}.name`)}
        </span>
      )}
    </nav>
  );
}
