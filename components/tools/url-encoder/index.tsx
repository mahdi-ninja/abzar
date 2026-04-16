"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { InputOutputLayout } from "@/components/ui/input-output-layout";

export default function UrlEncoder() {
  const t = useTranslations("urlEncoder");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [fullUrl, setFullUrl] = useState(false);
  const [error, setError] = useState("");

  const handleEncode = useCallback(() => {
    setError("");
    setOutput(fullUrl ? encodeURI(input) : encodeURIComponent(input));
  }, [input, fullUrl]);

  const handleDecode = useCallback(() => {
    setError("");
    try { setOutput(fullUrl ? decodeURI(input) : decodeURIComponent(input)); }
    catch { setError(t("invalidEncoded")); }
  }, [input, fullUrl, t]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Switch checked={fullUrl} onCheckedChange={setFullUrl} />
          <Label className="text-xs">{fullUrl ? t("fullUrlMode") : t("componentMode")}</Label>
        </div>
      </div>
      {error && <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
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
        <Button size="sm" onClick={handleEncode}>{t("encode")}</Button>
        <Button size="sm" variant="secondary" onClick={handleDecode}>{t("decode")}</Button>
        <Button size="sm" variant="outline" onClick={() => { setInput(""); setOutput(""); setError(""); }}>{t("clear")}</Button>
      </div>
    </div>
  );
}
