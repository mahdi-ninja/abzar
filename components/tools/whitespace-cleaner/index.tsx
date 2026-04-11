"use client";

import { useState, useMemo } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { InputOutputLayout } from "@/components/ui/input-output-layout";

export default function WhitespaceCleaner() {
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
        <Button size="sm" variant="outline" onClick={() => { setInput(""); setTrimTrailing(true); setNormalizeEol(true); setRemoveBlankLines(false); setRemoveInvisible(true); }}>Clear</Button>
      </div>
      <div className="flex flex-wrap gap-4">
        {[
          { label: "Trim trailing spaces", checked: trimTrailing, set: setTrimTrailing },
          { label: "Normalize line endings", checked: normalizeEol, set: setNormalizeEol },
          { label: "Remove extra blank lines", checked: removeBlankLines, set: setRemoveBlankLines },
          { label: "Remove invisible Unicode", checked: removeInvisible, set: setRemoveInvisible },
        ].map(({ label, checked, set }) => (
          <div key={label} className="flex items-center gap-1.5">
            <Switch checked={checked} onCheckedChange={set} />
            <Label className="text-xs">{label}</Label>
          </div>
        ))}
      </div>
      <InputOutputLayout
        inputLabel="Input"
        outputLabel="Cleaned"
        input={
          <Textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Paste text with whitespace issues..." className="min-h-[250px] font-mono text-sm" />
        }
        output={
          <>
            <div className="flex items-center justify-between">
              {changed && <span className="text-xs text-primary">(modified)</span>}
              {output && <div className="ml-auto"><CopyButton value={output} /></div>}
            </div>
            <Textarea value={output} readOnly className="min-h-[250px] font-mono text-sm" />
          </>
        }
      />
    </div>
  );
}
