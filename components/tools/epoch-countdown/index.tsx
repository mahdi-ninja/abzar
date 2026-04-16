"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CopyButton } from "@/components/ui/copy-button";

export default function EpochCountdown() {
  const t = useTranslations("epochCountdown");
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  const [input, setInput] = useState("");

  useEffect(() => {
    const timer = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(timer);
  }, []);

  const inputDate = (() => {
    if (!input.trim()) return null;
    const n = Number(input);
    if (!isNaN(n)) {
      return new Date(n > 1e12 ? n : n * 1000);
    }
    const d = new Date(input);
    return isNaN(d.getTime()) ? null : d;
  })();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-xs text-muted-foreground mb-1">{t("currentTimestamp")}</div>
        <div className="flex items-center justify-center gap-2">
          <span className="text-5xl font-bold tabular-nums font-mono">{now}</span>
          <CopyButton value={String(now)} label="" />
        </div>
        <div className="text-sm text-muted-foreground mt-1">{new Date(now * 1000).toISOString()}</div>
      </div>
      <div>
        <Label className="text-sm mb-1 block">{t("convertLabel")}</Label>
        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder={t("inputPlaceholder")} className="font-mono text-sm" />
      </div>
      {inputDate && (
        <div className="text-sm space-y-1 font-mono">
          <div>{t("epochSeconds", { value: Math.floor(inputDate.getTime() / 1000) })}</div>
          <div>{t("epochMs", { value: inputDate.getTime() })}</div>
          <div>{t("iso", { value: inputDate.toISOString() })}</div>
          <div>{t("local", { value: inputDate.toLocaleString() })}</div>
        </div>
      )}
    </div>
  );
}
