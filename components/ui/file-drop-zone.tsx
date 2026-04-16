"use client";

import { useCallback, useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface FileDropZoneProps {
  onFiles: (files: File[]) => void;
  accept?: string;
  maxSizeMB?: number;
  multiple?: boolean;
  label?: string;
  className?: string;
  children?: React.ReactNode;
}

export function FileDropZone({
  onFiles,
  accept,
  maxSizeMB = 50,
  multiple = false,
  label,
  className,
  children,
}: FileDropZoneProps) {
  const t = useTranslations("ui");
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (fileList: FileList) => {
      const files = Array.from(fileList);
      const maxBytes = maxSizeMB * 1024 * 1024;
      const valid = files.filter((f) => f.size <= maxBytes);
      if (valid.length > 0) {
        onFiles(multiple ? valid : [valid[0]]);
      }
    },
    [onFiles, maxSizeMB, multiple]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  return (
    <div
      className={cn(
        "relative flex min-h-30 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 p-6 text-center transition-colors hover:border-muted-foreground/50",
        dragActive && "border-primary bg-primary/5",
        className
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept}
        multiple={multiple}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
            e.target.value = "";
          }
        }}
      />
      {children ?? (
        <>
          <svg
            className="mb-2 h-8 w-8 text-muted-foreground/50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-sm text-muted-foreground">{label ?? t("dropFiles")}</p>
          {maxSizeMB && (
            <p className="mt-1 text-xs text-muted-foreground/70">
              {t("maxFileSize", { size: maxSizeMB })}
            </p>
          )}
        </>
      )}
    </div>
  );
}
