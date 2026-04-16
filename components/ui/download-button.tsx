"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DownloadButtonProps {
  data: string | Blob;
  filename: string;
  mimeType?: string;
  label?: string;
  className?: string;
}

export function DownloadButton({
  data,
  filename,
  mimeType = "text/plain",
  label,
  className,
}: DownloadButtonProps) {
  const t = useTranslations("ui");
  const handleDownload = useCallback(() => {
    const blob =
      data instanceof Blob ? data : new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [data, filename, mimeType]);

  return (
    <Button
      variant="outline"
      size="sm"
      className={cn("h-8 gap-1.5", className)}
      onClick={handleDownload}
    >
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
      </svg>
      {label ?? t("download")}
    </Button>
  );
}
