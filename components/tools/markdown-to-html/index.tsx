"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { DownloadButton } from "@/components/ui/download-button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { InputOutputLayout } from "@/components/ui/input-output-layout";

// ── Helpers ───────────────────────────────────────────────────────────────────

const BASIC_CSS = `body{font-family:system-ui,sans-serif;max-width:800px;margin:2rem auto;padding:0 1rem;line-height:1.6;color:#1a1a1a}
h1,h2,h3,h4,h5,h6{margin-top:1.5em;line-height:1.25}
code{background:#f0f0f0;padding:.2em .4em;border-radius:3px;font-size:.9em;font-family:monospace}
pre{background:#f6f8fa;border:1px solid #ddd;padding:1em;border-radius:4px;overflow-x:auto}
pre code{background:none;padding:0}
blockquote{border-left:4px solid #ddd;margin:0;padding-left:1em;color:#555}
table{border-collapse:collapse;width:100%}
th,td{border:1px solid #ddd;padding:.5em .75em}
th{background:#f6f8fa;text-align:left}
img{max-width:100%}
a{color:#0366d6}
hr{border:none;border-top:1px solid #ddd}`;

function wrapDocument(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
${BASIC_CSS}
  </style>
</head>
<body>
${body.trim()}
</body>
</html>`;
}

const EXAMPLE = `# Hello World

This is a **bold** statement and _italic_ text with \`inline code\`.

## Features

- Item one
- Item two
- Item three

## Ordered list

1. First
2. Second
3. Third

## Code block

\`\`\`js
console.log("Hello, World!");
\`\`\`

> A blockquote example.

| Column A | Column B |
|----------|----------|
| Cell 1   | Cell 2   |

[Link example](https://example.com)

---

![Alt text](https://example.com/image.png)`;

// ── Component ─────────────────────────────────────────────────────────────────

export default function MarkdownToHtml() {
  const [input, setInput] = useState("");
  const [fragment, setFragment] = useState(""); // raw HTML body from marked
  const [error, setError] = useState("");
  const [withStyles, setWithStyles] = useState(true);
  const markedRef = useRef<typeof import("marked") | null>(null);

  // Derive display output from fragment + toggle — no extra state
  const output = useMemo(
    () => (fragment ? (withStyles ? wrapDocument(fragment) : fragment) : ""),
    [fragment, withStyles]
  );

  const getMarked = useCallback(async () => {
    if (!markedRef.current) markedRef.current = await import("marked");
    return markedRef.current;
  }, []);

  const convert = useCallback(
    async (md: string) => {
      setError("");
      if (!md.trim()) { setFragment(""); return; }
      try {
        const lib = await getMarked();
        const raw = lib.marked(md);
        const body = typeof raw === "string" ? raw : await raw;
        setFragment(body);
      } catch (e) {
        setError((e as Error).message);
        setFragment("");
      }
    },
    [getMarked]
  );

  const loadExample = useCallback(() => {
    setInput(EXAMPLE);
    void convert(EXAMPLE);
  }, [convert]);

  const clear = useCallback(() => {
    setInput("");
    setFragment("");
    setError("");
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Switch
          checked={withStyles}
          onCheckedChange={(v) => v !== null && setWithStyles(v)}
        />
        <Label className="text-xs">Wrap in full HTML document with styles</Label>
      </div>
      <InputOutputLayout
        inputLabel="Markdown Input"
        outputLabel="HTML Output"
        input={
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type or paste Markdown here…"
            className="h-80 resize-none font-mono text-sm"
          />
        }
        output={
          <>
            {output && (
              <div className="flex justify-end gap-1">
                <CopyButton value={output} />
                <DownloadButton
                  data={output}
                  filename="output.html"
                  mimeType="text/html"
                  label=".html"
                />
              </div>
            )}
            <Textarea
              value={output}
              readOnly
              placeholder="HTML will appear here…"
              className="h-80 resize-none font-mono text-sm"
            />
          </>
        }
      />
      {error && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => void convert(input)}>
          Convert
        </Button>
        <Button size="sm" variant="secondary" onClick={loadExample}>
          Load example
        </Button>
        <Button size="sm" variant="outline" onClick={clear}>
          Clear
        </Button>
      </div>
    </div>
  );
}
