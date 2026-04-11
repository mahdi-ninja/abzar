"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { categories } from "@/lib/categories";
import { getToolsByCategory } from "@/lib/tools-registry";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/config";

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-border bg-sidebar text-sidebar-foreground transition-all duration-200",
        collapsed ? "w-14" : "w-60"
      )}
    >
      <div className="flex h-14 items-center justify-between border-b border-border px-3">
        {!collapsed && (
          <Link href="/" className="text-lg font-bold tracking-tight">
            {siteConfig.name}
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg
            className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Button>
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
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isActive &&
                      "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  )}
                  title={collapsed ? cat.name : undefined}
                >
                  <span className="shrink-0 text-base leading-none">{cat.icon}</span>
                  {!collapsed && (
                    <>
                      <span className="flex-1 truncate">{cat.name}</span>
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
