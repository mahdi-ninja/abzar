"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/config";
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

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Tool[]>([]);
  const router = useRouter();

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
    setResults(searchTools(value).slice(0, 12));
  }, []);

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
              aria-label="Open navigation"
            />
          }
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </SheetTrigger>
        <SheetContent side="left" className="w-60 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Logo — visible on mobile when sidebar is hidden */}
      <Link href="/" className="text-lg font-bold tracking-tight lg:hidden">
        {siteConfig.name}
      </Link>

      {/* Search trigger */}
      <div className="flex-1 flex justify-end lg:justify-center">
        <Button
          variant="outline"
          className="relative h-9 w-full max-w-sm justify-start rounded-md text-sm text-muted-foreground"
          onClick={() => setSearchOpen(true)}
        >
          <svg className="mr-2 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <span className="hidden sm:inline">Search tools...</span>
          <kbd className="pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      </div>

      <ThemeToggle />

      {/* Search dialog */}
      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput
          placeholder="Search tools..."
          value={query}
          onValueChange={handleSearch}
        />
        <CommandList>
          <CommandEmpty>No tools found.</CommandEmpty>
          {results.length > 0 && (
            <CommandGroup heading="Tools">
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
                        <span className="font-medium truncate">{tool.name}</span>
                        {!accessible && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            Coming Soon
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {tool.description}
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
