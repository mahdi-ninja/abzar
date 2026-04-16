"use client";

import { useTranslations } from "next-intl";
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
  inputLabel,
  outputLabel,
  className,
}: InputOutputLayoutProps) {
  const t = useTranslations("ui");
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 md:grid-cols-2",
        className
      )}
    >
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">{inputLabel ?? t("input")}</label>
        {input}
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">{outputLabel ?? t("output")}</label>
        {output}
      </div>
    </div>
  );
}
