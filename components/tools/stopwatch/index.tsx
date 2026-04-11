"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";

function formatMs(ms: number): string {
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  const centis = Math.floor((ms % 1000) / 10);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}.${String(centis).padStart(2, "0")}`;
}

export default function Stopwatch() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState<{ split: number; cumulative: number }[]>([]);
  const startRef = useRef(0);
  const offsetRef = useRef(0);
  const rafRef = useRef<number>(0);
  const tickRef = useRef<() => void>(() => {});

  const tick = useCallback(() => {
    setElapsed(Date.now() - startRef.current + offsetRef.current);
    rafRef.current = requestAnimationFrame(tickRef.current);
  }, []);
  useEffect(() => { tickRef.current = tick; }, [tick]);

  const start = useCallback(() => {
    startRef.current = Date.now();
    setRunning(true);
    rafRef.current = requestAnimationFrame(tickRef.current);
  }, []);

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    offsetRef.current += Date.now() - startRef.current;
    setRunning(false);
  }, []);

  const reset = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setRunning(false);
    setElapsed(0);
    offsetRef.current = 0;
    setLaps([]);
  }, []);

  const lap = useCallback(() => {
    const now = Date.now() - startRef.current + offsetRef.current;
    setLaps((prev) => {
      const lastCumulative = prev.length > 0 ? prev[prev.length - 1].cumulative : 0;
      return [...prev, { split: now - lastCumulative, cumulative: now }];
    });
  }, []);

  useEffect(() => { return () => cancelAnimationFrame(rafRef.current); }, []);

  const lapsText = laps.map((l, i) => `Lap ${i + 1}: ${formatMs(l.split)} (${formatMs(l.cumulative)})`).join("\n");

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-6xl font-bold tabular-nums font-mono">{formatMs(elapsed)}</div>
      </div>
      <div className="flex items-center justify-center gap-2">
        {!running ? (
          <Button onClick={start} className="w-24">{elapsed > 0 ? "Resume" : "Start"}</Button>
        ) : (
          <Button onClick={stop} variant="secondary" className="w-24">Stop</Button>
        )}
        {running && <Button variant="outline" onClick={lap}>Lap</Button>}
        {!running && elapsed > 0 && <Button variant="outline" onClick={reset}>Reset</Button>}
      </div>
      {laps.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Laps</span>
            <CopyButton value={lapsText} label="Copy" />
          </div>
          <div className="max-h-48 overflow-auto space-y-1 text-sm font-mono">
            {[...laps].reverse().map((l, i) => (
              <div key={laps.length - 1 - i} className="flex justify-between">
                <span className="text-muted-foreground">Lap {laps.length - i}</span>
                <span>{formatMs(l.split)}</span>
                <span className="text-muted-foreground">{formatMs(l.cumulative)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
