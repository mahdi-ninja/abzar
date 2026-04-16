"use client";

import { useState, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
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
  key: "expired" | "expiresInMinutes" | "expiresInHours";
  params?: Record<string, number>;
  variant: "default" | "secondary" | "destructive" | "outline";
} | null {
  const exp = payload.exp;
  if (typeof exp !== "number") return null;
  const now = Math.floor(Date.now() / 1000);
  if (exp < now) return { key: "expired", variant: "destructive" };
  const minutesLeft = Math.round((exp - now) / 60);
  if (minutesLeft < 60)
    return { key: "expiresInMinutes", params: { minutes: minutesLeft }, variant: "secondary" };
  const hoursLeft = Math.round(minutesLeft / 60);
  return { key: "expiresInHours", params: { hours: hoursLeft }, variant: "outline" };
}

export default function JwtDecoder() {
  const t = useTranslations("jwtDecoder");
  const [token, setToken] = useState("");

  const decoded = useMemo(() => {
    const trimmed = token.trim();
    if (!trimmed) return null;

    const parts = trimmed.split(".");
    if (parts.length !== 3) return { error: "errorInvalid3Parts" as const };

    try {
      const headerJson = base64UrlDecode(parts[0]);
      const payloadJson = base64UrlDecode(parts[1]);
      const header = tryParseJson(headerJson);
      const payload = tryParseJson(payloadJson);

      if (!header || !payload)
        return { error: "errorInvalidJson" as const };

      return { header, payload, signature: parts[2] };
    } catch {
      return { error: "errorBase64Failed" as const };
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
          <Label className="text-sm font-medium">{t("jwtToken")}</Label>
          <Button size="sm" variant="outline" onClick={handleClear}>
            {t("clear")}
          </Button>
        </div>
        <Textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder={t("placeholder")}
          className="min-h-25 font-mono text-sm break-all"
        />
      </div>

      {decoded && "error" in decoded && decoded.error && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {t(decoded.error)}
        </div>
      )}

      {decoded && "header" in decoded && (
        <div className="space-y-3">
          {/* Header */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium text-primary">{t("header")}</Label>
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
                <Label className="text-sm font-medium text-primary">{t("payload")}</Label>
                {expiryStatus && (
                  <Badge variant={expiryStatus.variant}>
                    {t(expiryStatus.key, expiryStatus.params)}
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
              { key: "iat", labelKey: "issuedAt" as const },
              { key: "exp", labelKey: "expires" as const },
              { key: "nbf", labelKey: "notBefore" as const },
            ].filter(({ key }) => typeof p[key] === "number");
            if (timestamps.length === 0) return null;
            return (
              <Card className="p-4">
                <Label className="text-sm font-medium mb-2 block">{t("timestamps")}</Label>
                <div className="space-y-1 text-sm">
                  {timestamps.map(({ key, labelKey }) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-muted-foreground">{t(labelKey)}</span>
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
                {t("signature")}
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
          {t("emptyState")}
        </div>
      )}
    </div>
  );
}
