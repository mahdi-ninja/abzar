"use client";

import { useState, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CopyButton } from "@/components/ui/copy-button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ALGOS = ["SHA-1", "SHA-256", "SHA-512"] as const;

export default function HmacGenerator() {
  const [message, setMessage] = useState("");
  const [secret, setSecret] = useState("");
  const [algo, setAlgo] = useState<string>("SHA-256");
  const [output, setOutput] = useState("");

  const generate = useCallback(async () => {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: algo }, false, ["sign"]);
    const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
    setOutput(Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join(""));
  }, [message, secret, algo]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-sm">Message</Label>
          <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Enter message..." className="min-h-[120px] font-mono text-sm" />
        </div>
        <div className="space-y-2">
          <Label className="text-sm">Secret Key</Label>
          <Input value={secret} onChange={(e) => setSecret(e.target.value)} placeholder="Enter secret key..." className="font-mono text-sm" />
          <Label className="text-sm">Algorithm</Label>
          <Select value={algo} onValueChange={(v) => v && setAlgo(v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{ALGOS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <Button size="sm" onClick={generate} disabled={!message || !secret}>Generate HMAC</Button>
      {output && (
        <Card className="p-3">
          <div className="flex items-center justify-between mb-1"><Label className="text-xs">HMAC-{algo}</Label><CopyButton value={output} /></div>
          <code className="text-xs font-mono break-all text-muted-foreground">{output}</code>
        </Card>
      )}
    </div>
  );
}
