"use client";

import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
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

interface KanbanBoard {
  id: string;
  name: string;
  columns: KanbanColumn[];
}

const DEFAULT_COLUMNS: KanbanColumn[] = [
  { id: "todo", title: "To Do", cards: [] },
  { id: "progress", title: "In Progress", cards: [] },
  { id: "done", title: "Done", cards: [] },
];

function createBoard(name: string): KanbanBoard {
  return {
    id: Date.now().toString(),
    name,
    columns: DEFAULT_COLUMNS.map((c) => ({ ...c, id: `${c.id}-${Date.now()}`, cards: [] })),
  };
}

export default function Kanban() {
  const [boards, setBoards] = useLocalStorage<KanbanBoard[]>(
    "abzar:kanban:boards",
    [createBoard("My Board")]
  );
  const [activeBoardId, setActiveBoardId] = useLocalStorage<string>(
    "abzar:kanban:active",
    boards[0]?.id ?? ""
  );
  const [newCardText, setNewCardText] = useState<Record<string, string>>({});
  const [dragCard, setDragCard] = useState<{ colId: string; cardId: string } | null>(null);
  const [newColTitle, setNewColTitle] = useState("");
  const [newBoardName, setNewBoardName] = useState("");
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");

  const board = useMemo(
    () => boards.find((b) => b.id === activeBoardId) ?? boards[0] ?? null,
    [boards, activeBoardId]
  );

  const updateBoard = useCallback(
    (updater: (b: KanbanBoard) => KanbanBoard) => {
      setBoards((prev) =>
        prev.map((b) => (b.id === (board?.id ?? activeBoardId) ? updater(b) : b))
      );
    },
    [board, activeBoardId, setBoards]
  );

  const addBoard = useCallback(() => {
    const name = newBoardName.trim() || `Board ${boards.length + 1}`;
    const b = createBoard(name);
    setBoards((prev) => [...prev, b]);
    setActiveBoardId(b.id);
    setNewBoardName("");
  }, [newBoardName, boards.length, setBoards, setActiveBoardId]);

  const deleteBoard = useCallback(
    (id: string) => {
      setBoards((prev) => {
        const next = prev.filter((b) => b.id !== id);
        if (next.length === 0) {
          const b = createBoard("My Board");
          setActiveBoardId(b.id);
          return [b];
        }
        if (activeBoardId === id) {
          setActiveBoardId(next[0].id);
        }
        return next;
      });
    },
    [activeBoardId, setBoards, setActiveBoardId]
  );

  const startRename = useCallback(() => {
    if (!board) return;
    setRenameValue(board.name);
    setRenaming(true);
  }, [board]);

  const finishRename = useCallback(() => {
    const name = renameValue.trim();
    if (name) {
      updateBoard((b) => ({ ...b, name }));
    }
    setRenaming(false);
  }, [renameValue, updateBoard]);

  // Column/card operations
  const addCard = useCallback(
    (colId: string) => {
      const text = (newCardText[colId] || "").trim();
      if (!text) return;
      updateBoard((b) => ({
        ...b,
        columns: b.columns.map((col) =>
          col.id === colId
            ? { ...col, cards: [...col.cards, { id: Date.now().toString(), title: text }] }
            : col
        ),
      }));
      setNewCardText((prev) => ({ ...prev, [colId]: "" }));
    },
    [newCardText, updateBoard]
  );

  const removeCard = useCallback(
    (colId: string, cardId: string) => {
      updateBoard((b) => ({
        ...b,
        columns: b.columns.map((col) =>
          col.id === colId
            ? { ...col, cards: col.cards.filter((c) => c.id !== cardId) }
            : col
        ),
      }));
    },
    [updateBoard]
  );

  const addColumn = useCallback(() => {
    const title = newColTitle.trim();
    if (!title) return;
    updateBoard((b) => ({
      ...b,
      columns: [...b.columns, { id: Date.now().toString(), title, cards: [] }],
    }));
    setNewColTitle("");
  }, [newColTitle, updateBoard]);

  const removeColumn = useCallback(
    (colId: string) => {
      updateBoard((b) => ({
        ...b,
        columns: b.columns.filter((c) => c.id !== colId),
      }));
    },
    [updateBoard]
  );

  const handleDragStart = useCallback((colId: string, cardId: string) => {
    setDragCard({ colId, cardId });
  }, []);

  const handleDrop = useCallback(
    (targetColId: string) => {
      if (!dragCard || !board) return;
      if (dragCard.colId === targetColId) {
        setDragCard(null);
        return;
      }
      updateBoard((b) => {
        const sourceCol = b.columns.find((c) => c.id === dragCard.colId);
        const card = sourceCol?.cards.find((c) => c.id === dragCard.cardId);
        if (!card) return b;
        return {
          ...b,
          columns: b.columns.map((col) => {
            if (col.id === dragCard.colId) {
              return { ...col, cards: col.cards.filter((c) => c.id !== dragCard.cardId) };
            }
            if (col.id === targetColId) {
              return { ...col, cards: [...col.cards, card] };
            }
            return col;
          }),
        };
      });
      setDragCard(null);
    },
    [dragCard, board, updateBoard]
  );

  if (!board) return null;

  const columns = board.columns;

  return (
    <div className="space-y-4">
      {/* Board switcher */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[180px]">
          <Label className="text-xs mb-1 block">Board</Label>
          <div className="flex items-center gap-2">
            <Select
              value={activeBoardId}
              onValueChange={(v) => v && setActiveBoardId(v)}
            >
              <SelectTrigger className="text-sm">
                <span>{board?.name ?? "Select board"}</span>
              </SelectTrigger>
              <SelectContent>
                {boards.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {renaming ? (
              <div className="flex gap-1">
                <Input
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && finishRename()}
                  className="h-8 text-sm w-36"
                  autoFocus
                />
                <Button size="sm" variant="secondary" onClick={finishRename} className="h-8">
                  Save
                </Button>
              </div>
            ) : (
              <Button size="sm" variant="ghost" onClick={startRename} className="h-8 text-xs">
                Rename
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-end gap-1">
          <Input
            value={newBoardName}
            onChange={(e) => setNewBoardName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addBoard()}
            placeholder="New board..."
            className="h-8 text-sm w-32"
          />
          <Button size="sm" variant="outline" onClick={addBoard} className="h-8">
            +
          </Button>
        </div>

        {boards.length > 1 && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => deleteBoard(board.id)}
            className="h-8 text-xs text-muted-foreground hover:text-destructive"
          >
            Delete Board
          </Button>
        )}
      </div>

      {/* Columns */}
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
                    aria-label="Remove column"
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
                      aria-label="Remove card"
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
