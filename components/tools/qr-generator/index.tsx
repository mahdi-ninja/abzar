"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { DownloadButton } from "@/components/ui/download-button";

type QRMode = "url" | "text" | "wifi" | "vcard";
type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";

export default function QrGenerator() {
  const t = useTranslations("qrGenerator");
  const [mode, setMode] = useState<QRMode>("url");
  const [url, setUrl] = useState("https://example.com");
  const [text, setText] = useState("");
  const [wifiSsid, setWifiSsid] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");
  const [wifiEncryption, setWifiEncryption] = useState("WPA");
  const [vcardName, setVcardName] = useState("");
  const [vcardPhone, setVcardPhone] = useState("");
  const [vcardEmail, setVcardEmail] = useState("");
  const [size, setSize] = useState(256);
  const [errorLevel, setErrorLevel] = useState<ErrorCorrectionLevel>("M");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrLib, setQrLib] = useState<typeof import("qrcode") | null>(null);
  const [pngBlob, setPngBlob] = useState<Blob | null>(null);

  // Load QR library on mount
  useEffect(() => {
    import("qrcode").then(setQrLib);
  }, []);

  const getContent = useCallback((): string => {
    switch (mode) {
      case "url":
        return url;
      case "text":
        return text;
      case "wifi":
        return `WIFI:T:${wifiEncryption};S:${wifiSsid};P:${wifiPassword};;`;
      case "vcard":
        return [
          "BEGIN:VCARD",
          "VERSION:3.0",
          `FN:${vcardName}`,
          vcardPhone ? `TEL:${vcardPhone}` : "",
          vcardEmail ? `EMAIL:${vcardEmail}` : "",
          "END:VCARD",
        ]
          .filter(Boolean)
          .join("\n");
    }
  }, [mode, url, text, wifiSsid, wifiPassword, wifiEncryption, vcardName, vcardPhone, vcardEmail]);

  // Generate QR code whenever inputs change
  useEffect(() => {
    if (!qrLib || !canvasRef.current) return;
    const content = getContent();
    if (!content.trim()) return;

    qrLib.toCanvas(canvasRef.current, content, {
      width: size,
      errorCorrectionLevel: errorLevel,
      margin: 2,
    }).then(() => {
      canvasRef.current?.toBlob((blob) => { if (blob) setPngBlob(blob); }, "image/png");
    }).catch(() => {
      // ignore QR generation errors for partial input
    });
  }, [qrLib, getContent, size, errorLevel]);

  const handleDownloadSvg = useCallback(async () => {
    if (!qrLib) return;
    const content = getContent();
    const svg = await qrLib.toString(content, {
      type: "svg",
      errorCorrectionLevel: errorLevel,
      margin: 2,
    });
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "qr-code.svg";
    a.click();
    URL.revokeObjectURL(url);
  }, [qrLib, getContent, errorLevel]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Input side */}
        <div className="space-y-4">
          <Tabs value={mode} onValueChange={(v) => setMode(v as QRMode)}>
            <TabsList className="h-8">
              <TabsTrigger value="url" className="text-xs px-2.5 h-6">{t("url")}</TabsTrigger>
              <TabsTrigger value="text" className="text-xs px-2.5 h-6">{t("text")}</TabsTrigger>
              <TabsTrigger value="wifi" className="text-xs px-2.5 h-6">{t("wifi")}</TabsTrigger>
              <TabsTrigger value="vcard" className="text-xs px-2.5 h-6">{t("vcard")}</TabsTrigger>
            </TabsList>
          </Tabs>

          {mode === "url" && (
            <div>
              <Label className="text-sm mb-1 block">{t("urlLabel")}</Label>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
              />
            </div>
          )}

          {mode === "text" && (
            <div>
              <Label className="text-sm mb-1 block">{t("textLabel")}</Label>
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t("enterText")}
              />
            </div>
          )}

          {mode === "wifi" && (
            <div className="space-y-3">
              <div>
                <Label className="text-sm mb-1 block">{t("networkName")}</Label>
                <Input value={wifiSsid} onChange={(e) => setWifiSsid(e.target.value)} />
              </div>
              <div>
                <Label className="text-sm mb-1 block">{t("password")}</Label>
                <Input value={wifiPassword} onChange={(e) => setWifiPassword(e.target.value)} />
              </div>
              <div>
                <Label className="text-sm mb-1 block">{t("encryption")}</Label>
                <Select value={wifiEncryption} onValueChange={(v) => v && setWifiEncryption(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WPA">WPA/WPA2</SelectItem>
                    <SelectItem value="WEP">WEP</SelectItem>
                    <SelectItem value="nopass">{t("encNone")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {mode === "vcard" && (
            <div className="space-y-3">
              <div>
                <Label className="text-sm mb-1 block">{t("name")}</Label>
                <Input value={vcardName} onChange={(e) => setVcardName(e.target.value)} />
              </div>
              <div>
                <Label className="text-sm mb-1 block">{t("phone")}</Label>
                <Input value={vcardPhone} onChange={(e) => setVcardPhone(e.target.value)} />
              </div>
              <div>
                <Label className="text-sm mb-1 block">{t("email")}</Label>
                <Input value={vcardEmail} onChange={(e) => setVcardEmail(e.target.value)} />
              </div>
            </div>
          )}

          {/* Options */}
          <div className="space-y-3 pt-2 border-t">
            <div>
              <Label className="text-sm mb-2 block">{t("size", { size })}</Label>
              <Slider
                value={[size]}
                onValueChange={(v) => setSize(Array.isArray(v) ? v[0] : v)}
                min={128}
                max={512}
                step={32}
              />
            </div>
            <div>
              <Label className="text-sm mb-1 block">{t("errorCorrection")}</Label>
              <Select value={errorLevel} onValueChange={(v) => v && setErrorLevel(v as ErrorCorrectionLevel)}>
                <SelectTrigger>
                  <span>{t(`ec${errorLevel === "L" ? "Low" : errorLevel === "M" ? "Medium" : errorLevel === "Q" ? "Quartile" : "High"}`)}</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="L">{t("ecLow")}</SelectItem>
                  <SelectItem value="M">{t("ecMedium")}</SelectItem>
                  <SelectItem value="Q">{t("ecQuartile")}</SelectItem>
                  <SelectItem value="H">{t("ecHigh")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Output side */}
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-lg border bg-white p-4">
            <canvas ref={canvasRef} />
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => { setMode("url"); setUrl("https://example.com"); setText(""); setWifiSsid(""); setWifiPassword(""); setWifiEncryption("WPA"); setVcardName(""); setVcardPhone(""); setVcardEmail(""); setSize(256); setErrorLevel("M"); }}>{t("reset")}</Button>
            {pngBlob && (
              <DownloadButton
                data={pngBlob}
                filename="qr-code.png"
                mimeType="image/png"
                label="PNG"
              />
            )}
            <Button size="sm" variant="outline" onClick={handleDownloadSvg} className="h-8 gap-1.5">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              SVG
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
