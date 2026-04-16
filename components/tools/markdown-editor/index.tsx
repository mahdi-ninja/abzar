"use client";

import { useState, useMemo, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { DownloadButton } from "@/components/ui/download-button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InputOutputLayout } from "@/components/ui/input-output-layout";

export default function MarkdownEditor() {
  const t = useTranslations("markdownEditor");
  const [input, setInput] = useState(
    "# Hello World\n\nThis is a **Markdown** editor with *live preview*.\n\n## Features\n\n- Real-time preview\n- Export as `.md` or `.html`\n- Copy rendered HTML\n\n> Try editing this text!\n\n```js\nconsole.log('Hello!');\n```\n"
  );
  const [markedLib, setMarkedLib] = useState<typeof import("marked") | null>(
    null
  );
  const [exportMode, setExportMode] = useState<"md" | "html">("md");
  const [purify, setPurify] = useState<typeof import("dompurify") | null>(null);

  useEffect(() => {
    Promise.all([import("marked"), import("dompurify")]).then(
      ([m, d]) => { setMarkedLib(m); setPurify(d); }
    );
  }, []);

  const html = useMemo(() => {
    if (!markedLib || !purify || !input.trim()) return "";
    try {
      const raw = markedLib.marked(input);
      const unsanitized = typeof raw === "string" ? raw : "";
      return purify.default.sanitize(unsanitized);
    } catch {
      return "<p>Error parsing markdown</p>";
    }
  }, [markedLib, purify, input]);

  const fullHtml = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Document</title></head>
<body>${html}</body></html>`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <CopyButton value={html} label={t("copyHtml")} />
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
            label={t("export")}
          />
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setInput("")}
        >
          {t("clear")}
        </Button>
      </div>

      <InputOutputLayout
        inputLabel={t("markdown")}
        outputLabel={t("preview")}
        input={
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("placeholder")}
            className="min-h-100 font-mono text-sm resize-none"
          />
        }
        output={
          <div
            className="min-h-100 overflow-auto rounded-md border bg-card p-4 prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        }
      />
    </div>
  );
}
