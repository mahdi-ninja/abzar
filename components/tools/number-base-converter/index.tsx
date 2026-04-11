"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CopyButton } from "@/components/ui/copy-button";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function NumberBaseConverter() {
  const [input, setInput] = useState("255");
  const [base, setBase] = useState(10);

  const parsed = useMemo(() => {
    try { return parseInt(input, base); } catch { return NaN; }
  }, [input, base]);

  const formats = useMemo(() => {
    if (isNaN(parsed)) return [];
    return [
      { label: "Decimal (10)", value: parsed.toString(10) },
      { label: "Binary (2)", value: parsed.toString(2) },
      { label: "Octal (8)", value: parsed.toString(8) },
      { label: "Hexadecimal (16)", value: parsed.toString(16).toUpperCase() },
    ];
  }, [parsed]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[200px]">
          <Label className="text-sm mb-1 block">Input</Label>
          <Input value={input} onChange={(e) => setInput(e.target.value)} className="font-mono" />
        </div>
        <Button size="sm" variant="outline" onClick={() => { setInput("255"); setBase(10); }}>Reset</Button>
        <div>
          <Label className="text-sm mb-1 block">Input base</Label>
          <div className="flex gap-1">
            {[2, 8, 10, 16].map((b) => (
              <button key={b} onClick={() => setBase(b)} className={`h-9 px-3 rounded border text-sm font-mono ${base === b ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"}`}>{b}</button>
            ))}
          </div>
        </div>
      </div>
      {isNaN(parsed) && input && <div className="text-sm text-destructive">Invalid number for base {base}</div>}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {formats.map(({ label, value }) => (
          <Card key={label} className="p-3">
            <div className="text-xs text-muted-foreground mb-1">{label}</div>
            <div className="flex items-center gap-2">
              <code className="flex-1 font-mono text-sm break-all">{value}</code>
              <CopyButton value={value} label="" className="shrink-0 h-7" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
