"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";

function toSlug(input: string, separator: string, maxLength: number, lowercase: boolean): string {
  let s = input.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (lowercase) s = s.toLowerCase();
  s = s.replace(/[^a-zA-Z0-9\s-]/g, "").replace(/[\s_]+/g, separator).replace(new RegExp(`[${separator}]+`, "g"), separator).replace(new RegExp(`^${separator}|${separator}$`, "g"), "");
  if (maxLength > 0) s = s.slice(0, maxLength).replace(new RegExp(`${separator}$`), "");
  return s;
}

export default function SlugGenerator() {
  const [input, setInput] = useState("");
  const [separator, setSeparator] = useState("-");
  const [maxLength, setMaxLength] = useState(0);
  const [lowercase, setLowercase] = useState(true);

  const slug = useMemo(() => toSlug(input, separator, maxLength, lowercase), [input, separator, maxLength, lowercase]);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" variant="outline" onClick={() => { setInput(""); setSeparator("-"); setMaxLength(0); setLowercase(true); }}>Clear</Button>
      </div>
      <div>
        <Label className="text-sm mb-1 block">Title or text</Label>
        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="My Blog Post Title" className="text-sm" />
      </div>
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <Label className="text-xs mb-1 block">Separator</Label>
          <div className="flex gap-1">
            {["-", "_", "."].map((s) => (
              <button key={s} onClick={() => setSeparator(s)} className={`h-8 w-8 rounded border text-sm font-mono ${separator === s ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"}`}>{s}</button>
            ))}
          </div>
        </div>
        <div>
          <Label className="text-xs mb-1 block">Max length (0=none)</Label>
          <Input type="number" min={0} max={200} value={maxLength} onChange={(e) => setMaxLength(Number(e.target.value))} className="w-24 text-sm" />
        </div>
        <div className="flex items-center gap-1.5">
          <Switch checked={lowercase} onCheckedChange={setLowercase} />
          <Label className="text-xs">Lowercase</Label>
        </div>
      </div>
      <div>
        <Label className="text-sm mb-1 block">Slug</Label>
        <div className="flex items-center gap-2">
          <Input value={slug} readOnly className="font-mono text-sm" />
          <CopyButton value={slug} />
        </div>
      </div>
    </div>
  );
}
