"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.replace("#", "").match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!m) return null;
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, Math.round(l * 100)];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function rgbToHsb(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  const s = max === 0 ? 0 : d / max;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(max * 100)];
}

function rgbToCmyk(r: number, g: number, b: number): [number, number, number, number] {
  if (r === 0 && g === 0 && b === 0) return [0, 0, 0, 100];
  const c = 1 - r / 255, m = 1 - g / 255, y = 1 - b / 255;
  const k = Math.min(c, m, y);
  return [
    Math.round(((c - k) / (1 - k)) * 100),
    Math.round(((m - k) / (1 - k)) * 100),
    Math.round(((y - k) / (1 - k)) * 100),
    Math.round(k * 100),
  ];
}

export default function ColorPicker() {
  const t = useTranslations("colorPicker");
  const [hex, setHex] = useState("#3b82f6");
  const [rgb, setRgb] = useState<[number, number, number]>(() => hexToRgb("#3b82f6") ?? [59, 130, 246]);

  const updateFromHex = useCallback((value: string) => {
    const clean = value.startsWith("#") ? value : `#${value}`;
    setHex(clean);
    const parsed = hexToRgb(clean);
    if (parsed) setRgb(parsed);
  }, []);

  const updateFromRgb = useCallback((r: number, g: number, b: number) => {
    const clamped: [number, number, number] = [
      Math.max(0, Math.min(255, r)),
      Math.max(0, Math.min(255, g)),
      Math.max(0, Math.min(255, b)),
    ];
    setRgb(clamped);
    setHex(rgbToHex(...clamped));
  }, []);

  const [r, g, b] = rgb;
  const hsl = rgbToHsl(r, g, b);
  const hsb = rgbToHsb(r, g, b);
  const cmyk = rgbToCmyk(r, g, b);

  const hexStr = hex.toUpperCase();
  const rgbStr = `rgb(${r}, ${g}, ${b})`;
  const hslStr = `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`;
  const hsbStr = `hsb(${hsb[0]}, ${hsb[1]}%, ${hsb[2]}%)`;
  const cmykStr = `cmyk(${cmyk[0]}%, ${cmyk[1]}%, ${cmyk[2]}%, ${cmyk[3]}%)`;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button size="sm" variant="outline" onClick={() => { updateFromHex("#3b82f6"); }}>{t("reset")}</Button>
      </div>
      {/* Color preview + picker */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div
          className="h-32 w-32 shrink-0 rounded-xl border shadow-sm"
          style={{ backgroundColor: hex }}
        />
        <div className="space-y-3 flex-1">
          <div>
            <Label htmlFor="color-input" className="text-sm mb-1 block">
              {t("pickColor")}
            </Label>
            <input
              id="color-input"
              type="color"
              value={hex}
              onChange={(e) => updateFromHex(e.target.value)}
              className="h-10 w-20 cursor-pointer rounded border"
            />
          </div>
        </div>
      </div>

      {/* Format fields */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* HEX */}
        <div className="space-y-1">
          <Label className="text-xs">HEX</Label>
          <div className="flex gap-2">
            <Input
              value={hexStr}
              onChange={(e) => updateFromHex(e.target.value)}
              className="font-mono text-sm"
            />
            <CopyButton value={hexStr} label="" className="shrink-0" />
          </div>
        </div>

        {/* RGB */}
        <div className="space-y-1">
          <Label className="text-xs">RGB</Label>
          <div className="flex gap-2">
            <Input value={rgbStr} readOnly className="font-mono text-sm" />
            <CopyButton value={rgbStr} label="" className="shrink-0" />
          </div>
        </div>

        {/* HSL */}
        <div className="space-y-1">
          <Label className="text-xs">HSL</Label>
          <div className="flex gap-2">
            <Input value={hslStr} readOnly className="font-mono text-sm" />
            <CopyButton value={hslStr} label="" className="shrink-0" />
          </div>
        </div>

        {/* HSB */}
        <div className="space-y-1">
          <Label className="text-xs">HSB</Label>
          <div className="flex gap-2">
            <Input value={hsbStr} readOnly className="font-mono text-sm" />
            <CopyButton value={hsbStr} label="" className="shrink-0" />
          </div>
        </div>

        {/* CMYK */}
        <div className="space-y-1">
          <Label className="text-xs">CMYK</Label>
          <div className="flex gap-2">
            <Input value={cmykStr} readOnly className="font-mono text-sm" />
            <CopyButton value={cmykStr} label="" className="shrink-0" />
          </div>
        </div>

        {/* RGB individual */}
        <div className="space-y-1">
          <Label className="text-xs">{t("rgbLabel")}</Label>
          <div className="flex gap-1">
            <Input
              type="number" min={0} max={255}
              value={r}
              onChange={(e) => updateFromRgb(Number(e.target.value), g, b)}
              className="font-mono text-sm text-center"
            />
            <Input
              type="number" min={0} max={255}
              value={g}
              onChange={(e) => updateFromRgb(r, Number(e.target.value), b)}
              className="font-mono text-sm text-center"
            />
            <Input
              type="number" min={0} max={255}
              value={b}
              onChange={(e) => updateFromRgb(r, g, Number(e.target.value))}
              className="font-mono text-sm text-center"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
