"use client";

import { cn } from "@/lib/utils";
import { CopyButton } from "@/components/ui/copy-button";

interface CodeBlockProps {
  code: string;
  language?: string;
  showCopy?: boolean;
  className?: string;
}

export function CodeBlock({
  code,
  language,
  showCopy = true,
  className,
}: CodeBlockProps) {
  return (
    <div className={cn("relative rounded-md border bg-muted/50", className)}>
      {(showCopy || language) && (
        <div className="flex items-center justify-between px-3 py-1.5 border-b text-xs text-muted-foreground">
          <span>{language ?? ""}</span>
          {showCopy && <CopyButton value={code} label="" className="h-6" />}
        </div>
      )}
      <pre className="overflow-auto p-3 text-sm font-mono">
        <code>{code}</code>
      </pre>
    </div>
  );
}
