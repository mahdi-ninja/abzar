"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useLocalStorage } from "@/lib/use-local-storage";

interface KanbanCard {
  id: string;
  title: string;
}

interface KanbanColumn {
  id: string;
  title: string;
  cards: KanbanCard[];
}

const DEFAULT_COLUMNS: KanbanColumn[] = [
  { id: "todo", title: "To Do", cards: [] },
  { id: "progress", title: "In Progress", cards: [] },
  { id: "done", title: "Done", cards: [] },
];

export default function Kanban() {
  const [columns, setColumns] = useLocalStorage<KanbanColumn[]>(
    "abzar:kanban:columns",
    DEFAULT_COLUMNS
  );
  const [newCardText, setNewCardText] = useState<Record<string, string>>({});
  const [dragCard, setDragCard] = useState<{ colId: string; cardId: string } | null>(null);
  const [newColTitle, setNewColTitle] = useState("");

  const addCard = useCallback(
    (colId: string) => {
      const text = (newCardText[colId] || "").trim();
      if (!text) return;
      setColumns((prev) =>
        prev.map((col) =>
          col.id === colId
            ? { ...col, cards: [...col.cards, { id: Date.now().toString(), title: text }] }
            : col
        )
      );
      setNewCardText((prev) => ({ ...prev, [colId]: "" }));
    },
    [newCardText, setColumns]
  );

  const removeCard = useCallback(
    (colId: string, cardId: string) => {
      setColumns((prev) =>
        prev.map((col) =>
          col.id === colId
            ? { ...col, cards: col.cards.filter((c) => c.id !== cardId) }
            : col
        )
      );
    },
    [setColumns]
  );

  const addColumn = useCallback(() => {
    const title = newColTitle.trim();
    if (!title) return;
    setColumns((prev) => [
      ...prev,
      { id: Date.now().toString(), title, cards: [] },
    ]);
    setNewColTitle("");
  }, [newColTitle, setColumns]);

  const removeColumn = useCallback(
    (colId: string) => {
      setColumns((prev) => prev.filter((c) => c.id !== colId));
    },
    [setColumns]
  );

  const handleDragStart = useCallback((colId: string, cardId: string) => {
    setDragCard({ colId, cardId });
  }, []);

  const handleDrop = useCallback(
    (targetColId: string) => {
      if (!dragCard) return;
      if (dragCard.colId === targetColId) {
        setDragCard(null);
        return;
      }
      setColumns((prev) => {
        const sourceCol = prev.find((c) => c.id === dragCard.colId);
        const card = sourceCol?.cards.find((c) => c.id === dragCard.cardId);
        if (!card) return prev;
        return prev.map((col) => {
          if (col.id === dragCard.colId) {
            return { ...col, cards: col.cards.filter((c) => c.id !== dragCard.cardId) };
          }
          if (col.id === targetColId) {
            return { ...col, cards: [...col.cards, card] };
          }
          return col;
        });
      });
      setDragCard(null);
    },
    [dragCard, setColumns]
  );

  return (
    <div className="space-y-4">
      <div className="flex overflow-x-auto gap-4 pb-4">
        {columns.map((col) => (
          <div
            key={col.id}
            className="flex-shrink-0 w-64 rounded-lg border bg-muted/30 p-3"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(col.id)}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">{col.title}</h3>
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">{col.cards.length}</span>
                {columns.length > 1 && (
                  <button
                    onClick={() => removeColumn(col.id)}
                    className="text-muted-foreground hover:text-destructive text-xs ml-1"
                    title="Remove column"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2 min-h-[50px]">
              {col.cards.map((card) => (
                <Card
                  key={card.id}
                  className="p-2.5 cursor-grab active:cursor-grabbing"
                  draggable
                  onDragStart={() => handleDragStart(col.id, card.id)}
                >
                  <div className="flex items-start justify-between gap-1">
                    <span className="text-sm">{card.title}</span>
                    <button
                      onClick={() => removeCard(col.id, card.id)}
                      className="text-muted-foreground hover:text-destructive text-xs shrink-0"
                    >
                      ×
                    </button>
                  </div>
                </Card>
              ))}
            </div>

            <div className="mt-3 flex gap-1">
              <Input
                value={newCardText[col.id] || ""}
                onChange={(e) =>
                  setNewCardText((prev) => ({ ...prev, [col.id]: e.target.value }))
                }
                onKeyDown={(e) => e.key === "Enter" && addCard(col.id)}
                placeholder="New card..."
                className="text-sm h-8"
              />
              <Button size="sm" variant="secondary" onClick={() => addCard(col.id)} className="h-8 shrink-0">
                +
              </Button>
            </div>
          </div>
        ))}

        {/* Add column */}
        <div className="flex-shrink-0 w-64">
          <div className="flex gap-1">
            <Input
              value={newColTitle}
              onChange={(e) => setNewColTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addColumn()}
              placeholder="New column..."
              className="text-sm h-8"
            />
            <Button size="sm" variant="outline" onClick={addColumn} className="h-8 shrink-0">
              +
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
