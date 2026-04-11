"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

function gcd(a: number, b: number): number { return b === 0 ? a : gcd(b, a % b); }

const PRESETS = [
  { label: "16:9", w: 16, h: 9 },
  { label: "4:3", w: 4, h: 3 },
  { label: "1:1", w: 1, h: 1 },
  { label: "21:9", w: 21, h: 9 },
  { label: "9:16", w: 9, h: 16 },
  { label: "3:2", w: 3, h: 2 },
];

export default function AspectRatio() {
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);

  const ratio = useMemo(() => {
    if (width <= 0 || height <= 0) return "—";
    const g = gcd(width, height);
    return `${width / g}:${height / g}`;
  }, [width, height]);

  const decimal = useMemo(() => height > 0 ? (width / height).toFixed(4) : "—", [width, height]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <div><Label className="text-sm mb-1 block">Width</Label><Input type="number" min={1} value={width} onChange={(e) => setWidth(Number(e.target.value))} className="w-32" /></div>
        <span className="pb-2 text-muted-foreground">×</span>
        <div><Label className="text-sm mb-1 block">Height</Label><Input type="number" min={1} value={height} onChange={(e) => setHeight(Number(e.target.value))} className="w-32" /></div>
      </div>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <Button key={p.label} size="sm" variant="outline" onClick={() => { setWidth(p.w * 100); setHeight(p.h * 100); }}>{p.label}</Button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4 text-center"><div className="text-2xl font-bold">{ratio}</div><div className="text-xs text-muted-foreground">Aspect Ratio</div></Card>
        <Card className="p-4 text-center"><div className="text-2xl font-bold tabular-nums">{decimal}</div><div className="text-xs text-muted-foreground">Decimal</div></Card>
      </div>
      <div className="mx-auto border-2 border-primary rounded" style={{ width: Math.min(300, width > height ? 300 : 300 * (width / height)), height: Math.min(200, height > width ? 200 : 200 * (height / width)), maxWidth: "100%" }}>
        <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">{width}×{height}</div>
      </div>
    </div>
  );
}
