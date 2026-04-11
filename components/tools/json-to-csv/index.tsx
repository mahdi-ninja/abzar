"use client";

import { useState, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { DownloadButton } from "@/components/ui/download-button";
import { InputOutputLayout } from "@/components/ui/input-output-layout";

function jsonToCsv(json: string): string {
  const data = JSON.parse(json);
  if (!Array.isArray(data) || data.length === 0) throw new Error("Expected a non-empty JSON array");
  const headers = [...new Set(data.flatMap((row: Record<string, unknown>) => Object.keys(row)))];
  const escape = (v: unknown) => {
    const s = String(v ?? "");
    return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const rows = data.map((row: Record<string, unknown>) => headers.map((h) => escape(row[h])).join(","));
  return [headers.join(","), ...rows].join("\n");
}

export default function JsonToCsv() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const convert = useCallback(() => {
    setError("");
    try { setOutput(jsonToCsv(input)); }
    catch (e) { setError((e as Error).message); setOutput(""); }
  }, [input]);

  return (
    <div className="space-y-4">
      <InputOutputLayout
        inputLabel="JSON Array"
        outputLabel="CSV Output"
        input={
          <Textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder='[{"name":"Alice","age":30},{"name":"Bob","age":25}]' className="min-h-[250px] font-mono text-sm" />
        }
        output={
          <>
            {output && <div className="flex justify-end gap-1"><CopyButton value={output} /><DownloadButton data={output} filename="data.csv" mimeType="text/csv" label=".csv" /></div>}
            <Textarea value={output} readOnly className="min-h-[250px] font-mono text-sm" />
          </>
        }
      />
      {error && <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
      <div className="flex gap-2">
        <Button size="sm" onClick={convert}>Convert</Button>
        <Button size="sm" variant="outline" onClick={() => { setInput(""); setOutput(""); setError(""); }}>Clear</Button>
      </div>
    </div>
  );
}
