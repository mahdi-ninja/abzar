"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { InputOutputLayout } from "@/components/ui/input-output-layout";

const converters: { label: string; fn: (s: string) => string }[] = [
  { label: "lowercase", fn: (s) => s.toLowerCase() },
  { label: "UPPERCASE", fn: (s) => s.toUpperCase() },
  { label: "Title Case", fn: (s) => s.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()) },
  { label: "Sentence case", fn: (s) => s.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, (c) => c.toUpperCase()) },
  { label: "camelCase", fn: (s) => s.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase()) },
  { label: "PascalCase", fn: (s) => { const c = s.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, ch: string) => ch.toUpperCase()); return c.charAt(0).toUpperCase() + c.slice(1); } },
  { label: "snake_case", fn: (s) => s.replace(/([a-z])([A-Z])/g, "$1_$2").replace(/[\s\-]+/g, "_").toLowerCase() },
  { label: "kebab-case", fn: (s) => s.replace(/([a-z])([A-Z])/g, "$1-$2").replace(/[\s_]+/g, "-").toLowerCase() },
  { label: "CONSTANT_CASE", fn: (s) => s.replace(/([a-z])([A-Z])/g, "$1_$2").replace(/[\s\-]+/g, "_").toUpperCase() },
  { label: "dot.case", fn: (s) => s.replace(/([a-z])([A-Z])/g, "$1.$2").replace(/[\s_\-]+/g, ".").toLowerCase() },
];

export default function CaseConverter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  return (
    <div className="space-y-4">
      <InputOutputLayout
        inputLabel="Input"
        outputLabel="Output"
        input={
          <Textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type or paste text here..." className="min-h-50 text-sm" />
        }
        output={
          <>
            {output && <div className="flex justify-end"><CopyButton value={output} /></div>}
            <Textarea value={output} readOnly className="min-h-50 text-sm" />
          </>
        }
      />
      <div className="flex flex-wrap gap-2">
        {converters.map((c) => (
          <Button key={c.label} size="sm" variant="secondary" onClick={() => setOutput(c.fn(input))}>
            {c.label}
          </Button>
        ))}
        <Button size="sm" variant="outline" onClick={() => { setInput(""); setOutput(""); }}>Clear</Button>
      </div>
    </div>
  );
}
