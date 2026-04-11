"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CopyButton } from "@/components/ui/copy-button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function RandomBytes() {
  const [count, setCount] = useState(32);
  const [format, setFormat] = useState("hex");
  const [output, setOutput] = useState("");

  const generate = useCallback(() => {
    const bytes = new Uint8Array(count);
    crypto.getRandomValues(bytes);
    if (format === "hex") {
      setOutput(Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join(""));
    } else if (format === "base64") {
      setOutput(btoa(String.fromCharCode(...bytes)));
    } else {
      setOutput(Array.from(bytes).join(", "));
    }
  }, [count, format]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div><Label className="text-xs mb-1 block">Bytes</Label><Input type="number" min={1} max={1024} value={count} onChange={(e) => setCount(Math.max(1, Math.min(1024, Number(e.target.value))))} className="w-24" /></div>
        <Tabs value={format} onValueChange={setFormat}>
          <TabsList className="h-8">
            <TabsTrigger value="hex" className="text-xs px-2.5 h-6">Hex</TabsTrigger>
            <TabsTrigger value="base64" className="text-xs px-2.5 h-6">Base64</TabsTrigger>
            <TabsTrigger value="decimal" className="text-xs px-2.5 h-6">Decimal</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button size="sm" onClick={generate}>Generate</Button>
      </div>
      {output && (
        <div className="space-y-2">
          <div className="flex justify-end"><CopyButton value={output} /></div>
          <div className="rounded-md border bg-muted/50 p-3 font-mono text-sm break-all">{output}</div>
        </div>
      )}
    </div>
  );
}
