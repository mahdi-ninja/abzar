"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { FileDropZone } from "@/components/ui/file-drop-zone";
import { DownloadButton } from "@/components/ui/download-button";

interface PdfFile {
  id: string;
  name: string;
  data: ArrayBuffer;
  pageCount: number;
}

export default function PdfMerger() {
  const t = useTranslations("pdfMerger");
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [merging, setMerging] = useState(false);
  const [mergedBlob, setMergedBlob] = useState<Blob | null>(null);
  const [error, setError] = useState("");

  const handleFiles = useCallback(async (newFiles: File[]) => {
    setError("");
    setMergedBlob(null);

    const pdfLib = await import("pdf-lib");

    const loaded: PdfFile[] = [];
    for (const file of newFiles) {
      try {
        const buffer = await file.arrayBuffer();
        const doc = await pdfLib.PDFDocument.load(buffer);
        loaded.push({
          id: Date.now().toString() + Math.random(),
          name: file.name,
          data: buffer,
          pageCount: doc.getPageCount(),
        });
      } catch {
        setError(t("loadError", { name: file.name }));
      }
    }
    setFiles((prev) => [...prev, ...loaded]);
  }, [t]);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setMergedBlob(null);
  }, []);

  const moveFile = useCallback((from: number, to: number) => {
    setFiles((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
    setMergedBlob(null);
  }, []);

  const handleMerge = useCallback(async () => {
    if (files.length < 2) return;
    setMerging(true);
    setError("");
    try {
      const pdfLib = await import("pdf-lib");
      const merged = await pdfLib.PDFDocument.create();

      for (const file of files) {
        const src = await pdfLib.PDFDocument.load(file.data);
        const pages = await merged.copyPages(src, src.getPageIndices());
        pages.forEach((page) => merged.addPage(page));
      }

      const bytes = await merged.save();
      setMergedBlob(new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" }));
    } catch {
      setError(t("mergeError"));
    } finally {
      setMerging(false);
    }
  }, [files, t]);

  const totalPages = files.reduce((sum, f) => sum + f.pageCount, 0);

  return (
    <div className="space-y-6">
      <FileDropZone
        onFiles={handleFiles}
        accept=".pdf,application/pdf"
        multiple
        label={t("dropLabel")}
        className="min-h-30"
      />

      {error && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            {t("filesSummary", { count: files.length, pages: totalPages })}
          </Label>
          {files.map((file, idx) => (
            <Card key={file.id} className="p-3 flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-6 text-right tabular-nums">
                {idx + 1}.
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{file.name}</div>
                <div className="text-xs text-muted-foreground">
                  {t("pageCount", { count: file.pageCount })}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => moveFile(idx, Math.max(0, idx - 1))}
                  disabled={idx === 0}
                  className="h-7 w-7 p-0"
                >
                  ↑
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => moveFile(idx, Math.min(files.length - 1, idx + 1))}
                  disabled={idx === files.length - 1}
                  className="h-7 w-7 p-0"
                >
                  ↓
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeFile(file.id)}
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                >
                  ×
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          onClick={handleMerge}
          disabled={files.length < 2 || merging}
        >
          {merging ? t("merging") : t("mergeButton", { count: files.length })}
        </Button>
        {mergedBlob && (
          <DownloadButton
            data={mergedBlob}
            filename="merged.pdf"
            label={t("downloadMerged")}
          />
        )}
        {files.length > 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setFiles([]);
              setMergedBlob(null);
            }}
          >
            {t("clearAll")}
          </Button>
        )}
      </div>

      {files.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          {t("emptyState")}
        </p>
      )}
    </div>
  );
}
