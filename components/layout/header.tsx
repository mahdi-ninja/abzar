"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import { ThemeToggle } from "@/components/theme-toggle";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { usePwa } from "@/components/pwa-provider";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Sidebar } from "@/components/layout/sidebar";
import { searchTools } from "@/lib/search";
import { isToolAccessible, type Tool } from "@/lib/tools-registry";
import { getCategoryBySlug } from "@/lib/categories";
import { getLocaleDir } from "@/lib/locale-config";

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Tool[]>([]);
  const router = useRouter();
  const { isOffline, isInstallable, promptInstall } = usePwa();
  const t = useTranslations("nav");
  const tSite = useTranslations("site");
  const tTools = useTranslations("tools");
  const locale = useLocale();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    if (value.trim().length === 0) {
      setResults([]);
      return;
    }
    setResults(searchTools(value, locale).slice(0, 12));
  }, [locale]);

  const handleSelect = useCallback(
    (tool: Tool) => {
      setSearchOpen(false);
      setQuery("");
      setResults([]);
      if (isToolAccessible(tool)) {
        router.push(`/tools/${tool.category}/${tool.slug}`);
      }
    },
    [router]
  );

  const dir = getLocaleDir(locale);

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/60">
      {/* Mobile hamburger */}
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 lg:hidden"
              aria-label={t("openNavigation")}
            />
          }
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </SheetTrigger>
        <SheetContent
          side={dir === "rtl" ? "right" : "left"}
          showCloseButton={false}
          className="w-60 max-w-[15rem] p-0"
        >
          <SheetTitle className="sr-only">{t("navigation")}</SheetTitle>
          <Sidebar variant="mobile" onClose={() => setMobileNavOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Logo — visible on mobile when sidebar is hidden */}
      <Link href="/" className="text-lg font-bold tracking-tight lg:hidden">
        {tSite("name")}
      </Link>

      {/* Search trigger */}
      <div className="flex-1 flex justify-end lg:justify-center">
        <Button
          variant="outline"
          className="relative h-9 w-full max-w-sm justify-start rounded-md text-sm text-muted-foreground"
          onClick={() => setSearchOpen(true)}
        >
          <svg className="me-2 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <span className="hidden sm:inline">{t("searchPlaceholder")}</span>
          <kbd className="pointer-events-none ms-auto hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      </div>

      {isOffline && (
        <span className="flex items-center gap-1 rounded-md bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive">
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <line x1="1" y1="1" x2="23" y2="23" />
            <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
            <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
            <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
            <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
            <line x1="12" y1="20" x2="12.01" y2="20" />
          </svg>
          {t("offline")}
        </span>
      )}

      {isInstallable && (
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={promptInstall}
          aria-label={t("installApp")}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </Button>
      )}

      <LocaleSwitcher />
      <ThemeToggle />

      {/* Search dialog */}
      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput
          placeholder={t("searchPlaceholder")}
          value={query}
          onValueChange={handleSearch}
        />
        <CommandList>
          <CommandEmpty>{t("noResults")}</CommandEmpty>
          {results.length > 0 && (
            <CommandGroup heading={t("toolsHeading")}>
              {results.map((tool) => {
                const cat = getCategoryBySlug(tool.category);
                const accessible = isToolAccessible(tool);
                return (
                  <CommandItem
                    key={tool.slug}
                    value={tool.slug}
                    onSelect={() => handleSelect(tool)}
                    disabled={!accessible}
                    className="flex items-center gap-2"
                  >
                    <span className="shrink-0 text-sm">{cat?.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{tTools(`${tool.slug}.name`)}</span>
                        {!accessible && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            {t("comingSoon")}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {tTools(`${tool.slug}.description`)}
                      </p>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </header>
  );
}
