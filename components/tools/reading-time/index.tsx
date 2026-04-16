"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ReadingTime() {
  const t = useTranslations("readingTime");
  const [text, setText] = useState("");

  const words = useMemo(() => text.trim() ? text.trim().split(/\s+/).length : 0, [text]);

  const times = useMemo(() => [
    { label: t("slow"), minutes: Math.max(1, Math.ceil(words / 150)) },
    { label: t("average"), minutes: Math.max(1, Math.ceil(words / 250)) },
    { label: t("fast"), minutes: Math.max(1, Math.ceil(words / 400)) },
    { label: t("speaking"), minutes: Math.max(1, Math.ceil(words / 150)) },
  ], [words, t]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">{t("words", { count: words })}</div>
        <Button size="sm" variant="outline" onClick={() => setText("")}>{t("clear")}</Button>
      </div>
      <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={t("placeholder")} className="min-h-50 text-sm" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {times.map(({ label, minutes }) => (
          <Card key={label} className="p-3 text-center">
            <div className="text-2xl font-bold tabular-nums">{t("min", { count: words === 0 ? 0 : minutes })}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
