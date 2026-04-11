"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";

type EscapeMode = "html" | "json" | "url" | "xml" | "csv";

const escapers: Record<EscapeMode, { escape: (s: string) => string; unescape: (s: string) => string }> = {
  html: {
    escape: (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;"),
    unescape: (s) => s.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&amp;/g, "&"),
  },
  json: {
    escape: (s) => JSON.stringify(s).slice(1, -1),
    unescape: (s) => { try { return JSON.parse(`"${s}"`); } catch { return s; } },
  },
  url: {
    escape: (s) => encodeURIComponent(s),
    unescape: (s) => { try { return decodeURIComponent(s); } catch { return s; } },
  },
  xml: {
    escape: (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;"),
    unescape: (s) => s.replace(/&apos;/g, "'").replace(/&quot;/g, '"').replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&amp;/g, "&"),
  },
  csv: {
    escape: (s) => `"${s.replace(/"/g, '""')}"`,
    unescape: (s) => { const m = s.match(/^"([\s\S]*)"$/); return m ? m[1].replace(/""/g, '"') : s; },
  },
};

export default function StringEscaper() {
  const [mode, setMode] = useState<EscapeMode>("html");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  return (
    <div className="space-y-4">
      <Tabs value={mode} onValueChange={(v) => { setMode(v as EscapeMode); setOutput(""); }}>
        <TabsList className="h-8">
          {(["html", "json", "url", "xml", "csv"] as const).map((m) => (
            <TabsTrigger key={m} value={m} className="text-xs px-2.5 h-6 uppercase">{m}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Input</label>
          <Textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Text to escape or unescape..." className="min-h-[200px] font-mono text-sm" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Output</label>
            {output && <CopyButton value={output} />}
          </div>
          <Textarea value={output} readOnly className="min-h-[200px] font-mono text-sm" />
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={() => setOutput(escapers[mode].escape(input))}>Escape</Button>
        <Button size="sm" variant="secondary" onClick={() => setOutput(escapers[mode].unescape(input))}>Unescape</Button>
        <Button size="sm" variant="outline" onClick={() => { setInput(""); setOutput(""); }}>Clear</Button>
      </div>
    </div>
  );
}
