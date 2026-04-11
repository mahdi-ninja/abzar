"use client";

import { useState, useCallback, useMemo } from "react";
import { useLocalStorage } from "@/lib/use-local-storage";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
}

function newNote(): Note {
  return {
    id: Date.now().toString(),
    title: "",
    content: "",
    updatedAt: Date.now(),
  };
}

export default function Notepad() {
  const [notes, setNotes] = useLocalStorage<Note[]>("abzar:notepad:notes", [newNote()]);
  const [activeId, setActiveId] = useState<string | null>(() => notes[0]?.id ?? null);

  const active = useMemo(() => notes.find((n) => n.id === activeId) ?? null, [notes, activeId]);

  const wordCount = useMemo(() => {
    if (!active?.content.trim()) return 0;
    return active.content.trim().split(/\s+/).length;
  }, [active]);

  const updateActive = useCallback(
    (updates: Partial<Note>) => {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === activeId ? { ...n, ...updates, updatedAt: Date.now() } : n
        )
      );
    },
    [activeId, setNotes]
  );

  const addNote = useCallback(() => {
    const n = newNote();
    setNotes((prev) => [n, ...prev]);
    setActiveId(n.id);
  }, [setNotes]);

  const deleteNote = useCallback(
    (id: string) => {
      setNotes((prev) => {
        const next = prev.filter((n) => n.id !== id);
        if (next.length === 0) {
          const n = newNote();
          setActiveId(n.id);
          return [n];
        }
        if (activeId === id) {
          setActiveId(next[0].id);
        }
        return next;
      });
    },
    [activeId, setNotes]
  );

  const sorted = useMemo(
    () => [...notes].sort((a, b) => b.updatedAt - a.updatedAt),
    [notes]
  );

  const preview = (content: string) => {
    const text = content.trim();
    if (!text) return "Empty note";
    return text.length > 80 ? text.slice(0, 80) + "..." : text;
  };

  const timeAgo = (ts: number) => {
    const diff = Date.now() - ts;
    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(ts).toLocaleDateString();
  };

  return (
    <div className="flex gap-4 min-h-[500px]">
      {/* Sidebar — note list */}
      <div className="w-56 shrink-0 space-y-2 hidden md:block">
        <Button size="sm" className="w-full" onClick={addNote}>
          + New Note
        </Button>
        <div className="space-y-1.5 max-h-[460px] overflow-y-auto">
          {sorted.map((note) => (
            <Card
              key={note.id}
              className={`p-2.5 cursor-pointer transition-colors ${
                note.id === activeId
                  ? "border-primary bg-accent"
                  : "hover:bg-muted/50"
              }`}
              onClick={() => setActiveId(note.id)}
            >
              <div className="flex items-start justify-between gap-1">
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium truncate">
                    {note.title || "Untitled"}
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate mt-0.5">
                    {preview(note.content)}
                  </div>
                  <div className="text-[10px] text-muted-foreground/60 mt-0.5">
                    {timeAgo(note.updatedAt)}
                  </div>
                </div>
                {notes.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNote(note.id);
                    }}
                    className="text-muted-foreground/50 hover:text-destructive text-xs shrink-0 mt-0.5"
                    aria-label="Delete note"
                  >
                    ×
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Mobile note selector */}
      <div className="md:hidden w-full space-y-3">
        {!active ? (
          <>
            <Button size="sm" className="w-full" onClick={addNote}>
              + New Note
            </Button>
            <div className="space-y-1.5">
              {sorted.map((note) => (
                <Card
                  key={note.id}
                  className="p-3 cursor-pointer hover:bg-muted/50"
                  onClick={() => setActiveId(note.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">
                        {note.title || "Untitled"}
                      </div>
                      <div className="text-xs text-muted-foreground truncate mt-0.5">
                        {preview(note.content)}
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {timeAgo(note.updatedAt)}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <NoteEditor
            note={active}
            wordCount={wordCount}
            onUpdate={updateActive}
            onBack={() => setActiveId(null)}
            showBack
          />
        )}
      </div>

      {/* Desktop editor */}
      {active && (
        <div className="flex-1 hidden md:block">
          <NoteEditor
            note={active}
            wordCount={wordCount}
            onUpdate={updateActive}
          />
        </div>
      )}
    </div>
  );
}

function NoteEditor({
  note,
  wordCount,
  onUpdate,
  onBack,
  showBack,
}: {
  note: Note;
  wordCount: number;
  onUpdate: (updates: Partial<Note>) => void;
  onBack?: () => void;
  showBack?: boolean;
}) {
  return (
    <div className="space-y-2 flex flex-col flex-1">
      {showBack && (
        <Button size="sm" variant="ghost" onClick={onBack} className="self-start">
          ← All Notes
        </Button>
      )}
      <Input
        value={note.title}
        onChange={(e) => onUpdate({ title: e.target.value })}
        placeholder="Note title..."
        className="text-lg font-medium border-0 px-0 shadow-none focus-visible:ring-0"
      />
      <Textarea
        value={note.content}
        onChange={(e) => onUpdate({ content: e.target.value })}
        placeholder="Start writing..."
        className="flex-1 min-h-[400px] text-sm resize-none"
      />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{wordCount} words · {note.content.length} characters</span>
        <span>Auto-saved</span>
      </div>
    </div>
  );
}
