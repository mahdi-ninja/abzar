"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function RandomGenerator() {
  const [mode, setMode] = useState("number");
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [count, setCount] = useState(1);
  const [results, setResults] = useState<string[]>([]);

  const generate = useCallback(() => {
    const out: string[] = [];
    for (let i = 0; i < count; i++) {
      if (mode === "number") {
        out.push(String(Math.floor(Math.random() * (max - min + 1)) + min));
      } else if (mode === "coin") {
        out.push(Math.random() < 0.5 ? "Heads" : "Tails");
      } else if (mode === "dice") {
        out.push(String(Math.floor(Math.random() * 6) + 1));
      }
    }
    setResults(out);
  }, [mode, min, max, count]);

  return (
    <div className="space-y-6">
      <Tabs value={mode} onValueChange={(v) => { setMode(v); setResults([]); }}>
        <TabsList className="h-8">
          <TabsTrigger value="number" className="text-xs px-3 h-6">Number</TabsTrigger>
          <TabsTrigger value="coin" className="text-xs px-3 h-6">Coin Flip</TabsTrigger>
          <TabsTrigger value="dice" className="text-xs px-3 h-6">Dice</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="flex flex-wrap items-end gap-3">
        {mode === "number" && (
          <>
            <div><Label className="text-xs mb-1 block">Min</Label><Input type="number" value={min} onChange={(e) => setMin(Number(e.target.value))} className="w-24" /></div>
            <div><Label className="text-xs mb-1 block">Max</Label><Input type="number" value={max} onChange={(e) => setMax(Number(e.target.value))} className="w-24" /></div>
          </>
        )}
        <div><Label className="text-xs mb-1 block">Count</Label><Input type="number" min={1} max={100} value={count} onChange={(e) => setCount(Math.max(1, Number(e.target.value)))} className="w-20" /></div>
        <Button size="sm" onClick={generate}>Generate</Button>
      </div>
      {results.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {results.map((r, i) => (
            <Card key={i} className="px-4 py-2">
              <span className="text-lg font-bold tabular-nums">{r}</span>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
