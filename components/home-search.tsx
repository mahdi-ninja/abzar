"use client";

import { useState, useCallback } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { searchTools } from "@/lib/search";
import { isToolAccessible, type Tool } from "@/lib/tools-registry";
import { getCategoryBySlug } from "@/lib/categories";

export function HomeSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Tool[]>([]);
  const router = useRouter();
  const t = useTranslations("nav");

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    if (value.trim().length === 0) {
      setResults([]);
      return;
    }
    setResults(searchTools(value).slice(0, 8));
  }, []);

  const handleSelect = useCallback(
    (tool: Tool) => {
      if (isToolAccessible(tool)) {
        router.push(`/tools/${tool.category}/${tool.slug}`);
        setQuery("");
        setResults([]);
      }
    },
    [router]
  );

  return (
    <Command className="rounded-lg border shadow-sm" shouldFilter={false}>
      <CommandInput
        placeholder={t("searchPlaceholder")}
        value={query}
        onValueChange={handleSearch}
      />
      {query.trim().length > 0 && (
        <CommandList>
          <CommandEmpty>{t("noResults")}</CommandEmpty>
          {results.length > 0 && (
            <CommandGroup>
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
                      <span className="font-medium text-sm">{tool.name}</span>
                      <p className="text-xs text-muted-foreground truncate">
                        {tool.description}
                      </p>
                    </div>
                    {!accessible && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">
                        {t("comingSoon")}
                      </Badge>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}
        </CommandList>
      )}
    </Command>
  );
}
