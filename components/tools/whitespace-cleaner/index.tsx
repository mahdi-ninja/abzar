"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { InputOutputLayout } from "@/components/ui/input-output-layout";

export default function WhitespaceCleaner() {
  const t = useTranslations("whitespaceCleaner");
  const [input, setInput] = useState("");
  const [trimTrailing, setTrimTrailing] = useState(true);
  const [normalizeEol, setNormalizeEol] = useState(true);
  const [removeBlankLines, setRemoveBlankLines] = useState(false);
  const [removeInvisible, setRemoveInvisible] = useState(true);

  const output = useMemo(() => {
    let s = input;
    if (normalizeEol) s = s.replace(/\r\n?/g, "\n");
    if (trimTrailing) s = s.split("\n").map((l) => l.trimEnd()).join("\n");
    if (removeBlankLines) s = s.replace(/\n{3,}/g, "\n\n");
    if (removeInvisible) s = s.replace(/[\u200B-\u200F\u2028\u2029\uFEFF\u00AD]/g, "");
    return s;
  }, [input, trimTrailing, normalizeEol, removeBlankLines, removeInvisible]);

  const changed = input !== output;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" variant="outline" onClick={() => { setInput(""); setTrimTrailing(true); setNormalizeEol(true); setRemoveBlankLines(false); setRemoveInvisible(true); }}>{t("clear")}</Button>
      </div>
      <div className="flex flex-wrap gap-4">
        {[
          { key: "trimTrailing", checked: trimTrailing, set: setTrimTrailing },
          { key: "normalizeEol", checked: normalizeEol, set: setNormalizeEol },
          { key: "removeBlankLines", checked: removeBlankLines, set: setRemoveBlankLines },
          { key: "removeInvisible", checked: removeInvisible, set: setRemoveInvisible },
        ].map(({ key, checked, set }) => (
          <div key={key} className="flex items-center gap-1.5">
            <Switch checked={checked} onCheckedChange={set} />
            <Label className="text-xs">{t(key)}</Label>
          </div>
        ))}
      </div>
      <InputOutputLayout
        outputLabel={t("cleanedLabel")}
        input={
          <Textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder={t("inputPlaceholder")} className="min-h-62.5 font-mono text-sm" />
        }
        output={
          <>
            <div className="flex items-center justify-between">
              {changed && <span className="text-xs text-primary">{t("modified")}</span>}
              {output && <div className="ms-auto"><CopyButton value={output} /></div>}
            </div>
            <Textarea value={output} readOnly className="min-h-62.5 font-mono text-sm" />
          </>
        }
      />
    </div>
  );
}
