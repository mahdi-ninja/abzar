"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { InputOutputLayout } from "@/components/ui/input-output-layout";

function encodeHtmlEntities(s: string, numeric: boolean): string {
  if (numeric) return [...s].map((c) => `&#${c.charCodeAt(0)};`).join("");
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function decodeHtmlEntities(s: string): string {
  const el = typeof document !== "undefined" ? document.createElement("textarea") : null;
  if (!el) return s;
  el.innerHTML = s;
  return el.value;
}

export default function HtmlEntities() {
  const t = useTranslations("htmlEntities");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [numeric, setNumeric] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1.5">
        <Switch checked={numeric} onCheckedChange={setNumeric} />
        <Label className="text-xs">{numeric ? t("numericMode") : t("namedMode")}</Label>
      </div>
      <InputOutputLayout
        input={
          <Textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder={t("inputPlaceholder")} className="min-h-50 font-mono text-sm" />
        }
        output={
          <>
            {output && <div className="flex justify-end"><CopyButton value={output} /></div>}
            <Textarea value={output} readOnly className="min-h-50 font-mono text-sm" />
          </>
        }
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={() => setOutput(encodeHtmlEntities(input, numeric))}>{t("encode")}</Button>
        <Button size="sm" variant="secondary" onClick={() => setOutput(decodeHtmlEntities(input))}>{t("decode")}</Button>
        <Button size="sm" variant="outline" onClick={() => { setInput(""); setOutput(""); }}>{t("clear")}</Button>
      </div>
    </div>
  );
}
