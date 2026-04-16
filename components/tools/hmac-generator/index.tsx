"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CopyButton } from "@/components/ui/copy-button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";

const ALGOS = ["SHA-1", "SHA-256", "SHA-512"] as const;

export default function HmacGenerator() {
  const t = useTranslations("hmacGenerator");
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
          <Label className="text-sm">{t("message")}</Label>
          <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t("messagePlaceholder")} className="min-h-30 font-mono text-sm" />
        </div>
        <div className="space-y-2">
          <Label className="text-sm">{t("secretKey")}</Label>
          <Input value={secret} onChange={(e) => setSecret(e.target.value)} placeholder={t("secretPlaceholder")} className="font-mono text-sm" />
          <Label className="text-sm">{t("algorithm")}</Label>
          <Select value={algo} onValueChange={(v) => v && setAlgo(v)}>
            <SelectTrigger><span>{algo}</span></SelectTrigger>
            <SelectContent>{ALGOS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={generate} disabled={!message || !secret}>{t("generateHmac")}</Button>
        <Button size="sm" variant="outline" onClick={() => { setMessage(""); setSecret(""); setAlgo("SHA-256"); setOutput(""); }}>{t("clear")}</Button>
      </div>
      {output && (
        <Card className="p-3">
          <div className="flex items-center justify-between mb-1"><Label className="text-xs">HMAC-{algo}</Label><CopyButton value={output} /></div>
          <code className="text-xs font-mono break-all text-muted-foreground">{output}</code>
        </Card>
      )}
    </div>
  );
}
