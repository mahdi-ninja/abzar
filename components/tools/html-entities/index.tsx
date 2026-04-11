"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

function encodeHtmlEntities(s: string, numeric: boolean): string {
  if (numeric) return [...s].map((c) => `&#${c.charCodeAt(0)};`).join("");
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function decodeHtmlEntities(s: string): string {
  const el = typeof document !== "undefined" ? document.createElement("textarea") : null;
  if (!el) return s;
  el.innerHTML = s;
  return el.value;
}

export default function HtmlEntities() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [numeric, setNumeric] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1.5">
        <Switch checked={numeric} onCheckedChange={setNumeric} />
        <Label className="text-xs">{numeric ? "Numeric entities (&#123;)" : "Named entities (&amp;)"}</Label>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Input</label>
          <Textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="HTML text..." className="min-h-[200px] font-mono text-sm" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between"><label className="text-sm font-medium">Output</label>{output && <CopyButton value={output} />}</div>
          <Textarea value={output} readOnly className="min-h-[200px] font-mono text-sm" />
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={() => setOutput(encodeHtmlEntities(input, numeric))}>Encode</Button>
        <Button size="sm" variant="secondary" onClick={() => setOutput(decodeHtmlEntities(input))}>Decode</Button>
        <Button size="sm" variant="outline" onClick={() => { setInput(""); setOutput(""); }}>Clear</Button>
      </div>
    </div>
  );
}
