"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CopyButton } from "@/components/ui/copy-button";

interface GradientStop {
  color: string;
  position: number;
}

type GradientType = "linear" | "radial" | "conic";

export default function GradientGenerator() {
  const [type, setType] = useState<GradientType>("linear");
  const [angle, setAngle] = useState(90);
  const [stops, setStops] = useState<GradientStop[]>([
    { color: "#f59e0b", position: 0 },
    { color: "#ef4444", position: 100 },
  ]);

  const updateStop = useCallback(
    (index: number, updates: Partial<GradientStop>) => {
      setStops((prev) =>
        prev.map((s, i) => (i === index ? { ...s, ...updates } : s))
      );
    },
    []
  );

  const addStop = useCallback(() => {
    setStops((prev) => [...prev, { color: "#3b82f6", position: 50 }]);
  }, []);

  const removeStop = useCallback(
    (index: number) => {
      if (stops.length <= 2) return;
      setStops((prev) => prev.filter((_, i) => i !== index));
    },
    [stops.length]
  );

  const stopsStr = stops
    .sort((a, b) => a.position - b.position)
    .map((s) => `${s.color} ${s.position}%`)
    .join(", ");

  let cssValue: string;
  if (type === "linear") {
    cssValue = `linear-gradient(${angle}deg, ${stopsStr})`;
  } else if (type === "radial") {
    cssValue = `radial-gradient(circle, ${stopsStr})`;
  } else {
    cssValue = `conic-gradient(from ${angle}deg, ${stopsStr})`;
  }

  const cssRule = `background: ${cssValue};`;

  return (
    <div className="space-y-6">
      {/* Preview */}
      <div
        className="h-48 w-full rounded-lg border shadow-sm"
        style={{ background: cssValue }}
      />

      {/* Type + angle */}
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <Label className="text-sm mb-1 block">Type</Label>
          <Tabs value={type} onValueChange={(v) => setType(v as GradientType)}>
            <TabsList className="h-8">
              <TabsTrigger value="linear" className="text-xs px-2.5 h-6">Linear</TabsTrigger>
              <TabsTrigger value="radial" className="text-xs px-2.5 h-6">Radial</TabsTrigger>
              <TabsTrigger value="conic" className="text-xs px-2.5 h-6">Conic</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {(type === "linear" || type === "conic") && (
          <div className="flex-1 min-w-[150px]">
            <Label className="text-sm mb-1 block">Angle: {angle}°</Label>
            <Slider
              value={[angle]}
              onValueChange={(v) => setAngle(Array.isArray(v) ? v[0] : v)}
              min={0}
              max={360}
              step={1}
            />
          </div>
        )}
      </div>

      {/* Stops */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Color Stops</Label>
          <Button size="sm" variant="outline" onClick={addStop}>
            Add Stop
          </Button>
        </div>
        {stops.map((stop, i) => (
          <div key={i} className="flex items-center gap-3">
            <input
              type="color"
              value={stop.color}
              onChange={(e) => updateStop(i, { color: e.target.value })}
              className="h-8 w-10 cursor-pointer rounded border"
            />
            <Input
              value={stop.color}
              onChange={(e) => updateStop(i, { color: e.target.value })}
              className="w-28 font-mono text-sm"
            />
            <div className="flex-1">
              <Slider
                value={[stop.position]}
                onValueChange={(v) =>
                  updateStop(i, { position: Array.isArray(v) ? v[0] : v })
                }
                min={0}
                max={100}
                step={1}
              />
            </div>
            <span className="text-xs text-muted-foreground w-8 text-right tabular-nums">
              {stop.position}%
            </span>
            {stops.length > 2 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => removeStop(i)}
                className="h-7 w-7 p-0 text-muted-foreground"
              >
                ×
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* CSS output */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">CSS</Label>
          <CopyButton value={cssRule} />
        </div>
        <div className="rounded-md border bg-muted/50 p-3 font-mono text-sm break-all">
          {cssRule}
        </div>
      </div>
    </div>
  );
}
