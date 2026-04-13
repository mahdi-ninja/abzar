"use client";

import { useState, useMemo, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) base64 += "=";
  return atob(base64);
}

function tryParseJson(str: string): object | null {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

function getExpiryStatus(payload: Record<string, unknown>): {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
} | null {
  const exp = payload.exp;
  if (typeof exp !== "number") return null;
  const now = Math.floor(Date.now() / 1000);
  if (exp < now) return { label: "Expired", variant: "destructive" };
  const minutesLeft = Math.round((exp - now) / 60);
  if (minutesLeft < 60)
    return { label: `Expires in ${minutesLeft}m`, variant: "secondary" };
  const hoursLeft = Math.round(minutesLeft / 60);
  return { label: `Expires in ${hoursLeft}h`, variant: "outline" };
}

export default function JwtDecoder() {
  const [token, setToken] = useState("");

  const decoded = useMemo(() => {
    const trimmed = token.trim();
    if (!trimmed) return null;

    const parts = trimmed.split(".");
    if (parts.length !== 3) return { error: "Invalid JWT: expected 3 parts separated by dots" };

    try {
      const headerJson = base64UrlDecode(parts[0]);
      const payloadJson = base64UrlDecode(parts[1]);
      const header = tryParseJson(headerJson);
      const payload = tryParseJson(payloadJson);

      if (!header || !payload)
        return { error: "Invalid JWT: could not parse header or payload as JSON" };

      return { header, payload, signature: parts[2] };
    } catch {
      return { error: "Invalid JWT: base64 decoding failed" };
    }
  }, [token]);

  const handleClear = useCallback(() => setToken(""), []);

  const expiryStatus =
    decoded && "payload" in decoded
      ? getExpiryStatus(decoded.payload as Record<string, unknown>)
      : null;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">JWT Token</Label>
          <Button size="sm" variant="outline" onClick={handleClear}>
            Clear
          </Button>
        </div>
        <Textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Paste your JWT here (eyJhbGci...)"
          className="min-h-25 font-mono text-sm break-all"
        />
      </div>

      {decoded && "error" in decoded && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {decoded.error}
        </div>
      )}

      {decoded && "header" in decoded && (
        <div className="space-y-3">
          {/* Header */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium text-primary">Header</Label>
              <CopyButton value={JSON.stringify(decoded.header, null, 2)} />
            </div>
            <pre className="overflow-auto rounded bg-muted p-3 font-mono text-sm">
              {JSON.stringify(decoded.header, null, 2)}
            </pre>
          </Card>

          {/* Payload */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium text-primary">Payload</Label>
                {expiryStatus && (
                  <Badge variant={expiryStatus.variant}>
                    {expiryStatus.label}
                  </Badge>
                )}
              </div>
              <CopyButton value={JSON.stringify(decoded.payload, null, 2)} />
            </div>
            <pre className="overflow-auto rounded bg-muted p-3 font-mono text-sm">
              {JSON.stringify(decoded.payload, null, 2)}
            </pre>
          </Card>

          {/* Timestamps */}
          {(() => {
            const p = decoded.payload as Record<string, unknown>;
            const timestamps = [
              { key: "iat", label: "Issued At" },
              { key: "exp", label: "Expires" },
              { key: "nbf", label: "Not Before" },
            ].filter(({ key }) => typeof p[key] === "number");
            if (timestamps.length === 0) return null;
            return (
              <Card className="p-4">
                <Label className="text-sm font-medium mb-2 block">Timestamps</Label>
                <div className="space-y-1 text-sm">
                  {timestamps.map(({ key, label }) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-mono">
                        {new Date((p[key] as number) * 1000).toISOString()}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })()}

          {/* Signature */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium text-muted-foreground">
                Signature
              </Label>
              <CopyButton value={decoded.signature ?? ""} />
            </div>
            <code className="text-xs font-mono text-muted-foreground break-all">
              {decoded.signature ?? ""}
            </code>
          </Card>
        </div>
      )}

      {!token.trim() && (
        <div className="text-center text-sm text-muted-foreground py-8">
          Paste a JWT token to decode its header, payload, and verify expiration.
        </div>
      )}
    </div>
  );
}
