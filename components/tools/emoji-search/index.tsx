"use client";
import { useState, useMemo, useCallback } from "react";
import Fuse from "fuse.js";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useLocalStorage } from "@/lib/use-local-storage";
import { EMOJIS, CATEGORIES, type Emoji } from "./data";

const fuse = new Fuse(EMOJIS, {
  keys: [
    { name: "name", weight: 0.7 },
    { name: "keywords", weight: 0.3 },
  ],
  threshold: 0.4,
  ignoreLocation: true,
  minMatchCharLength: 1,
});

export default function EmojiSearch() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [recentIds, setRecentIds] = useLocalStorage<string[]>(
    "abzar:emoji-search:recent",
    [],
  );

  const filtered = useMemo(() => {
    const q = query.trim();

    if (!q) {
      return category === "All"
        ? EMOJIS
        : EMOJIS.filter((e) => e.category === category);
    }

    const results = fuse.search(q).map((r) => r.item);
    return category === "All"
      ? results
      : results.filter((e) => e.category === category);
  }, [query, category]);

  const recent = useMemo(
    () => recentIds.map((c) => EMOJIS.find((e) => e.char === c)).filter(Boolean) as Emoji[],
    [recentIds],
  );

  const copy = useCallback(
    (emoji: Emoji) => {
      navigator.clipboard.writeText(emoji.char).then(
        () => {
          toast.success(`Copied ${emoji.char}`);
          setRecentIds((prev) =>
            [emoji.char, ...prev.filter((c) => c !== emoji.char)].slice(0, 16),
          );
        },
        () => toast.error("Copy failed"),
      );
    },
    [setRecentIds],
  );

  return (
    <div className="space-y-3">
      {recent.length > 0 && !query && category === "All" && (
        <div>
          <p className="text-xs text-muted-foreground mb-1">Recently used</p>
          <div className="flex flex-wrap gap-1">
            {recent.map((e) => (
              <button
                key={e.char}
                onClick={() => copy(e)}
                title={e.name}
                className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-muted/50 text-xl hover:bg-muted hover:scale-105 transition-transform"
              >
                {e.char}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-1 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              category === cat
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80 text-muted-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <Input
        placeholder="Search emojis…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full"
        autoComplete="off"
      />

      <div className="text-xs text-muted-foreground">
        {filtered.length} emoji{filtered.length !== 1 ? "s" : ""} — click to copy
      </div>

      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-1 max-h-[440px] overflow-y-auto pr-1">
        {filtered.map((emoji) => (
          <button
            key={emoji.char}
            onClick={() => copy(emoji)}
            title={emoji.name}
            className="flex h-10 w-full items-center justify-center rounded-md border border-transparent bg-muted/30 text-xl hover:bg-muted hover:border-border transition-all"
          >
            {emoji.char}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-8">No emojis found for &ldquo;{query}&rdquo;</p>
      )}
    </div>
  );
}
