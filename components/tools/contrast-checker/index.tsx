"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function hexToRgb(hex: string): [number, number, number] | null {
  const clean = hex.replace("#", "");
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return [r, g, b];
  }
  if (clean.length === 6) {
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return [r, g, b];
  }
  return null;
}

function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r / 255, g / 255, b / 255].map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(lum1: number, lum2: number): number {
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

interface WcagResult {
  level: string;
  normalText: boolean;
  largeText: boolean;
}

function checkWcag(ratio: number): WcagResult[] {
  return [
    {
      level: "AA",
      normalText: ratio >= 4.5,
      largeText: ratio >= 3,
    },
    {
      level: "AAA",
      normalText: ratio >= 7,
      largeText: ratio >= 4.5,
    },
  ];
}

export default function ContrastChecker() {
  const t = useTranslations("contrastChecker");
  const [fg, setFg] = useState("#000000");
  const [bg, setBg] = useState("#ffffff");

  const result = useMemo(() => {
    const fgRgb = hexToRgb(fg);
    const bgRgb = hexToRgb(bg);
    if (!fgRgb || !bgRgb) return null;

    const fgLum = relativeLuminance(...fgRgb);
    const bgLum = relativeLuminance(...bgRgb);
    const ratio = contrastRatio(fgLum, bgLum);
    const wcag = checkWcag(ratio);

    return { ratio, wcag };
  }, [fg, bg]);

  const handleSwap = () => {
    setFg(bg);
    setBg(fg);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button size="sm" variant="outline" onClick={() => { setFg("#000000"); setBg("#ffffff"); }}>{t("reset")}</Button>
      </div>
      {/* Color inputs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
        <div className="space-y-2">
          <Label className="text-sm">{t("foreground")}</Label>
          <div className="flex gap-2">
            <input
              type="color"
              value={fg}
              onChange={(e) => setFg(e.target.value)}
              className="h-9 w-12 cursor-pointer rounded border"
            />
            <Input
              value={fg}
              onChange={(e) => setFg(e.target.value)}
              className="font-mono text-sm"
            />
          </div>
        </div>

        <button
          onClick={handleSwap}
          className="self-center rounded-md border p-2 hover:bg-accent transition-colors"
          aria-label={t("swapColors")}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </button>

        <div className="space-y-2">
          <Label className="text-sm">{t("background")}</Label>
          <div className="flex gap-2">
            <input
              type="color"
              value={bg}
              onChange={(e) => setBg(e.target.value)}
              className="h-9 w-12 cursor-pointer rounded border"
            />
            <Input
              value={bg}
              onChange={(e) => setBg(e.target.value)}
              className="font-mono text-sm"
            />
          </div>
        </div>
      </div>

      {/* Preview */}
      <div
        className="rounded-lg border p-6 space-y-2"
        style={{ backgroundColor: bg, color: fg }}
      >
        <p className="text-2xl font-bold">{t("largeTextPreview")}</p>
        <p className="text-base">
          {t("normalTextPreview")}
        </p>
        <p className="text-sm">{t("smallTextPreview")}</p>
      </div>

      {/* Ratio + results */}
      {result && (
        <>
          <Card className="p-4 text-center">
            <div className="text-4xl font-bold tabular-nums">
              {result.ratio.toFixed(2)}:1
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {t("contrastRatio")}
            </div>
          </Card>

          <div className="overflow-auto rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-2 text-start font-medium">{t("level")}</th>
                  <th className="px-4 py-2 text-center font-medium">{t("normalText")}</th>
                  <th className="px-4 py-2 text-center font-medium">{t("largeText")}</th>
                </tr>
              </thead>
              <tbody>
                {result.wcag.map((w) => (
                  <tr key={w.level} className="border-b last:border-0">
                    <td className="px-4 py-2 font-medium">WCAG {w.level}</td>
                    <td className="px-4 py-2 text-center">
                      <Badge variant={w.normalText ? "default" : "destructive"} className="text-xs">
                        {w.normalText ? t("pass") : t("fail")}
                      </Badge>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <Badge variant={w.largeText ? "default" : "destructive"} className="text-xs">
                        {w.largeText ? t("pass") : t("fail")}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
