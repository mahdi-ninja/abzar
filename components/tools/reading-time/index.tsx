"use client";

import { useState, useMemo } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ReadingTime() {
  const [text, setText] = useState("");

  const words = useMemo(() => text.trim() ? text.trim().split(/\s+/).length : 0, [text]);

  const times = useMemo(() => [
    { label: "Slow (150 WPM)", minutes: Math.max(1, Math.ceil(words / 150)) },
    { label: "Average (250 WPM)", minutes: Math.max(1, Math.ceil(words / 250)) },
    { label: "Fast (400 WPM)", minutes: Math.max(1, Math.ceil(words / 400)) },
    { label: "Speaking (150 WPM)", minutes: Math.max(1, Math.ceil(words / 150)) },
  ], [words]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">{words} words</div>
        <Button size="sm" variant="outline" onClick={() => setText("")}>Clear</Button>
      </div>
      <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste your text here to estimate reading time..." className="min-h-[200px] text-sm" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {times.map(({ label, minutes }) => (
          <Card key={label} className="p-3 text-center">
            <div className="text-2xl font-bold tabular-nums">{words === 0 ? "0" : minutes} min</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
