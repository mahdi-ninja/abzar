"use client";

import { useState, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CopyButton } from "@/components/ui/copy-button";
import { Card } from "@/components/ui/card";

function parseTimestamp(input: string): Date | null {
  if (!input.trim()) return null;

  // Unix timestamp (seconds or milliseconds)
  const num = Number(input.trim());
  if (!isNaN(num)) {
    if (num > 1e12) return new Date(num); // milliseconds
    if (num > 1e9) return new Date(num * 1000); // seconds
    return null;
  }

  // Try ISO / standard date parsing
  const d = new Date(input.trim());
  if (!isNaN(d.getTime())) return d;

  return null;
}

function formatRow(label: string, value: string) {
  return { label, value };
}

export default function TimestampConverter() {
  const t = useTranslations("timestampConverter");
  const [input, setInput] = useState("");

  const handleNow = useCallback(() => {
    setInput(String(Math.floor(Date.now() / 1000)));
  }, []);

  const handleClear = useCallback(() => setInput(""), []);

  const date = useMemo(() => parseTimestamp(input), [input]);

  const formats = useMemo(() => {
    if (!date) return [];
    return [
      formatRow(t("fmtUnixSeconds"), String(Math.floor(date.getTime() / 1000))),
      formatRow(t("fmtUnixMs"), String(date.getTime())),
      formatRow(t("fmtIso"), date.toISOString()),
      formatRow(t("fmtRfc"), date.toUTCString()),
      formatRow(
        t("fmtLocal"),
        date.toLocaleString(undefined, {
          dateStyle: "full",
          timeStyle: "long",
        })
      ),
      formatRow(t("fmtDate"), date.toISOString().split("T")[0]),
      formatRow(
        t("fmtTime"),
        date.toLocaleTimeString(undefined, { hour12: false })
      ),
      formatRow(
        t("fmtRelative"),
        getRelativeTime(date, t)
      ),
    ];
  }, [date, t]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-50">
          <Label className="text-sm mb-1 block">
            {t("inputLabel")}
          </Label>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("inputPlaceholder")}
            className="font-mono text-sm"
          />
        </div>
        <Button size="sm" onClick={handleNow}>
          {t("now")}
        </Button>
        <Button size="sm" variant="outline" onClick={handleClear}>
          {t("clear")}
        </Button>
      </div>

      {input.trim() && !date && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {t("parseError")}
        </div>
      )}

      {formats.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {formats.map(({ label, value }) => (
            <Card key={label} className="p-3">
              <div className="text-xs text-muted-foreground mb-1">{label}</div>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm font-mono truncate">
                  {value}
                </code>
                <CopyButton value={value} label="" className="shrink-0 h-7" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {!input.trim() && (
        <div className="text-center text-sm text-muted-foreground py-8">
          {t("emptyHint")}
        </div>
      )}
    </div>
  );
}

function getRelativeTime(date: Date, t: (key: string, values?: Record<string, unknown>) => string): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const absDiff = Math.abs(diff);
  const future = diff < 0;

  const seconds = Math.floor(absDiff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  let text: string;
  if (seconds < 60) text = t("seconds", { count: seconds });
  else if (minutes < 60) text = t("minutes", { count: minutes });
  else if (hours < 24) text = t("hours", { count: hours });
  else if (days < 30) text = t("days", { count: days });
  else if (months < 12) text = t("months", { count: months });
  else text = t("years", { count: years });

  return future ? t("inFuture", { time: text }) : t("ago", { time: text });
}
