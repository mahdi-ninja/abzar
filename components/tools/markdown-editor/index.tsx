"use client";

import { useState, useMemo, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { DownloadButton } from "@/components/ui/download-button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MarkdownEditor() {
  const [input, setInput] = useState(
    "# Hello World\n\nThis is a **Markdown** editor with *live preview*.\n\n## Features\n\n- Real-time preview\n- Export as `.md` or `.html`\n- Copy rendered HTML\n\n> Try editing this text!\n\n```js\nconsole.log('Hello!');\n```\n"
  );
  const [markedLib, setMarkedLib] = useState<typeof import("marked") | null>(
    null
  );
  const [exportMode, setExportMode] = useState<"md" | "html">("md");

  useEffect(() => {
    import("marked").then(setMarkedLib);
  }, []);

  const html = useMemo(() => {
    if (!markedLib || !input.trim()) return "";
    try {
      const result = markedLib.marked(input);
      return typeof result === "string" ? result : "";
    } catch {
      return "<p>Error parsing markdown</p>";
    }
  }, [markedLib, input]);

  const fullHtml = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Document</title></head>
<body>${html}</body></html>`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <CopyButton value={html} label="Copy HTML" />
          <Tabs
            value={exportMode}
            onValueChange={(v) => setExportMode(v as "md" | "html")}
          >
            <TabsList className="h-8">
              <TabsTrigger value="md" className="text-xs px-2.5 h-6">
                .md
              </TabsTrigger>
              <TabsTrigger value="html" className="text-xs px-2.5 h-6">
                .html
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <DownloadButton
            data={exportMode === "md" ? input : fullHtml}
            filename={exportMode === "md" ? "document.md" : "document.html"}
            mimeType={
              exportMode === "md" ? "text/markdown" : "text/html"
            }
            label="Export"
          />
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setInput("")}
        >
          Clear
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Markdown</Label>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Write Markdown here..."
            className="min-h-[400px] font-mono text-sm resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Preview</Label>
          <div
            className="min-h-[400px] overflow-auto rounded-md border bg-card p-4 prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </div>
  );
}
