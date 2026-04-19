"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { categories } from "@/lib/categories";
import { getToolsByCategory } from "@/lib/tools-registry";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  variant?: "desktop" | "mobile";
  collapsed?: boolean;
  onToggle?: () => void;
  onClose?: () => void;
}

export function Sidebar({
  variant = "desktop",
  collapsed = false,
  onToggle,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const tSite = useTranslations("site");
  const tCat = useTranslations("categories");
  const isMobile = variant === "mobile";
  const showBrand = isMobile || !collapsed;
  const buttonLabel = isMobile
    ? t("closeNavigation")
    : collapsed
      ? t("expandSidebar")
      : t("collapseSidebar");
  const handleButtonClick = isMobile ? onClose : onToggle;
  const handleNavigate = isMobile ? onClose : undefined;

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-e border-border bg-sidebar text-sidebar-foreground transition-all duration-200",
        isMobile ? "w-full" : collapsed ? "w-14" : "w-60"
      )}
    >
      <div className="flex h-14 items-center justify-between border-b border-border px-3">
        {showBrand && (
          <Link href="/" className="text-lg font-bold tracking-tight" onClick={handleNavigate}>
            {tSite("name")}
          </Link>
        )}
        {handleButtonClick && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={handleButtonClick}
            aria-label={buttonLabel}
          >
            <svg
              className={cn(
                "h-4 w-4 transition-transform rtl:-scale-x-100",
                !isMobile && collapsed && "rotate-180"
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-0.5">
          {categories.map((cat) => {
            const isActive =
              pathname === `/tools/${cat.slug}` ||
              pathname.startsWith(`/tools/${cat.slug}/`);
            const toolCount = getToolsByCategory(cat.slug).length;

            return (
              <li key={cat.slug}>
                <Link
                  href={`/tools/${cat.slug}`}
                  onClick={handleNavigate}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isActive &&
                      "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  )}
                  title={!isMobile && collapsed ? tCat(`${cat.slug}.name`) : undefined}
                >
                  <span className="shrink-0 text-base leading-none">{cat.icon}</span>
                  {(isMobile || !collapsed) && (
                    <>
                      <span className="flex-1 truncate">{tCat(`${cat.slug}.name`)}</span>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {toolCount}
                      </span>
                    </>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
