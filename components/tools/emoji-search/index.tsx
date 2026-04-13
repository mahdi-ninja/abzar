"use client";
import { useState, useMemo, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { EMOJIS, CATEGORIES, type Emoji } from "./data";

export default function EmojiSearch() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [recentIds, setRecentIds] = useState<string[]>(() => {
    try {
      const s = localStorage.getItem("abzar:emoji-search:recent");
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return EMOJIS.filter((e) => {
      const matchCat = category === "All" || e.category === category;
      if (!matchCat) return false;
      if (!q) return true;
      return (
        e.name.includes(q) ||
        e.char === q ||
        e.keywords.some((k) => k.includes(q))
      );
    });
  }, [query, category]);

  const recent = useMemo(
    () => recentIds.map((c) => EMOJIS.find((e) => e.char === c)).filter(Boolean) as Emoji[],
    [recentIds],
  );

  const copy = useCallback((emoji: Emoji) => {
    navigator.clipboard.writeText(emoji.char).then(
      () => {
        toast.success(`Copied ${emoji.char}`);
        setRecentIds((prev) => {
          const next = [emoji.char, ...prev.filter((c) => c !== emoji.char)].slice(0, 16);
          try { localStorage.setItem("abzar:emoji-search:recent", JSON.stringify(next)); } catch {}
          return next;
        });
      },
      () => toast.error("Copy failed"),
    );
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          placeholder="Search emojis…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
          autoComplete="off"
        />
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
      </div>

      {recent.length > 0 && !query && category === "All" && (
        <div>
          <p className="text-xs text-muted-foreground mb-1">Recently used</p>
          <div className="flex flex-wrap gap-1">
            {recent.map((e) => (
              <button
                key={e.char}
                onClick={() => copy(e)}
                title={e.name}
                className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-muted/50 text-xl hover:bg-muted hover:scale-110 transition-transform"
              >
                {e.char}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        {filtered.length} emoji{filtered.length !== 1 ? "s" : ""} — click to copy
      </div>

      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-1 max-h-[440px] overflow-y-auto pr-1">
        {filtered.map((emoji) => (
          <button
            key={emoji.char}
            onClick={() => copy(emoji)}
            title={emoji.name}
            className="flex h-10 w-full items-center justify-center rounded-md border border-transparent bg-muted/30 text-xl hover:bg-muted hover:scale-110 hover:border-border transition-all"
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
