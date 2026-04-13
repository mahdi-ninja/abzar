"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

const ROWS = 40;
const COLS = 60;

function createEmptyGrid(): boolean[][] {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(false));
}

function randomGrid(): boolean[][] {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => Math.random() > 0.7)
  );
}

function countNeighbors(grid: boolean[][], r: number, c: number): number {
  let count = 0;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && grid[nr][nc]) {
        count++;
      }
    }
  }
  return count;
}

function nextGeneration(grid: boolean[][]): boolean[][] {
  return grid.map((row, r) =>
    row.map((cell, c) => {
      const n = countNeighbors(grid, r, c);
      if (cell) return n === 2 || n === 3;
      return n === 3;
    })
  );
}

export default function GameOfLife() {
  const [grid, setGrid] = useState(createEmptyGrid);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(100);
  const [generation, setGeneration] = useState(0);
  const runningRef = useRef(false);
  const speedRef = useRef(speed);
  const [painting, setPainting] = useState(false);

  useEffect(() => {
    runningRef.current = running;
  }, [running]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  const step = useCallback(() => {
    setGrid((prev) => nextGeneration(prev));
    setGeneration((prev) => prev + 1);
  }, []);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!running) return;
    const tick = () => {
      if (!runningRef.current) return;
      step();
      timerRef.current = setTimeout(tick, speedRef.current);
    };
    timerRef.current = setTimeout(tick, speedRef.current);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [running, step]);

  const handleClear = useCallback(() => {
    setRunning(false);
    setGrid(createEmptyGrid());
    setGeneration(0);
  }, []);

  const handleRandom = useCallback(() => {
    setGrid(randomGrid());
    setGeneration(0);
  }, []);

  const toggleCell = useCallback((r: number, c: number) => {
    setGrid((prev) => {
      const next = prev.map((row) => [...row]);
      next[r][c] = !next[r][c];
      return next;
    });
  }, []);

  const liveCells = grid.flat().filter(Boolean).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <Button onClick={() => setRunning((p) => !p)} className="w-20">
          {running ? "Pause" : "Play"}
        </Button>
        <Button size="sm" variant="outline" onClick={step} disabled={running}>
          Step
        </Button>
        <Button size="sm" variant="outline" onClick={handleRandom}>
          Random
        </Button>
        <Button size="sm" variant="outline" onClick={handleClear}>
          Clear
        </Button>
        <div className="flex-1 min-w-30 max-w-50">
          <Label className="text-xs mb-1 block">Speed: {speed}ms</Label>
          <Slider
            value={[speed]}
            onValueChange={(v) => setSpeed(Array.isArray(v) ? v[0] : v)}
            min={20}
            max={500}
            step={10}
          />
        </div>
        <div className="text-xs text-muted-foreground">
          Gen: {generation} · Cells: {liveCells}
        </div>
      </div>

      <div
        className="overflow-auto border rounded-md inline-block select-none"
        onMouseLeave={() => setPainting(false)}
        onMouseUp={() => setPainting(false)}
      >
        {grid.map((row, r) => (
          <div key={r} className="flex">
            {row.map((cell, c) => (
              <div
                key={c}
                className={`w-3 h-3 border-[0.5px] border-border/10 transition-colors ${
                  cell ? "bg-primary" : "bg-background"
                }`}
                onMouseDown={() => {
                  setPainting(true);
                  toggleCell(r, c);
                }}
                onMouseEnter={() => {
                  if (painting) toggleCell(r, c);
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
