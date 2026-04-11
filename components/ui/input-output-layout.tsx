"use client";

import { cn } from "@/lib/utils";

interface InputOutputLayoutProps {
  input: React.ReactNode;
  output: React.ReactNode;
  inputLabel?: string;
  outputLabel?: string;
  className?: string;
}

export function InputOutputLayout({
  input,
  output,
  inputLabel = "Input",
  outputLabel = "Output",
  className,
}: InputOutputLayoutProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 md:grid-cols-2",
        className
      )}
    >
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">{inputLabel}</label>
        {input}
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">{outputLabel}</label>
        {output}
      </div>
    </div>
  );
}
