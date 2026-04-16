"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { DownloadButton } from "@/components/ui/download-button";

function seededRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function buildPerm(seed: number) {
  const rand = seededRng(seed);
  const p = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  return [...p, ...p];
}

function fade(t: number) { return t * t * t * (t * (t * 6 - 15) + 10); }
function lerp(a: number, b: number, t: number) { return a + t * (b - a); }
function grad(h: number, x: number, y: number) { return ((h & 1) ? -x : x) + ((h & 2) ? -y : y); }

function noise(perm: number[], x: number, y: number) {
  const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
  x -= Math.floor(x); y -= Math.floor(y);
  const u = fade(x), v = fade(y);
  const a = perm[X] + Y, b = perm[X + 1] + Y;
  return lerp(
    lerp(grad(perm[a], x, y), grad(perm[b], x - 1, y), u),
    lerp(grad(perm[a + 1], x, y - 1), grad(perm[b + 1], x - 1, y - 1), u),
    v,
  );
}

function fbm(perm: number[], x: number, y: number, octaves: number) {
  let v = 0, amp = 1, freq = 1, max = 0;
  for (let i = 0; i < octaves; i++) {
    v += noise(perm, x * freq, y * freq) * amp;
    max += amp;
    amp *= 0.5;
    freq *= 2;
  }
  return v / max;
}

// Terrain color bands: deep water → shallow → sand → grass → rock → snow
const BANDS: Array<{ limit: number; color: [number, number, number] }> = [
  { limit: 0.30, color: [20, 60, 130] },
  { limit: 0.38, color: [50, 100, 180] },
  { limit: 0.42, color: [200, 190, 120] },
  { limit: 0.58, color: [80, 140, 60] },
  { limit: 0.74, color: [100, 80, 60] },
  { limit: 0.88, color: [120, 100, 80] },
  { limit: 1.00, color: [240, 240, 250] },
];

function getColor(v: number): [number, number, number] {
  for (const band of BANDS) {
    if (v <= band.limit) return band.color;
  }
  return [240, 240, 250];
}

export default function TerrainGenerator() {
  const t = useTranslations("terrainGenerator");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [seed, setSeed] = useState(123);
  const [scale, setScale] = useState(4);
  const [octaves, setOctaves] = useState(6);
  const [blob, setBlob] = useState<Blob | null>(null);

  const generate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = 600, H = 400;
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const perm = buildPerm(seed);
    const img = ctx.createImageData(W, H);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const nx = x / W * scale;
        const ny = y / H * scale;
        const v = (fbm(perm, nx, ny, octaves) + 1) / 2;
        const [r, g, b] = getColor(v);
        const i = (y * W + x) * 4;
        img.data[i] = r;
        img.data[i + 1] = g;
        img.data[i + 2] = b;
        img.data[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    canvas.toBlob((bl) => bl && setBlob(bl));
  }, [seed, scale, octaves]);

  useEffect(() => { generate(); }, [generate]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-32.5 max-w-50">
          <Label className="text-xs mb-1 block">{t("seedLabel", { value: seed })}</Label>
          <Slider value={[seed]} onValueChange={(v) => setSeed(Array.isArray(v) ? v[0] : v)} min={1} max={9999} step={1} />
        </div>
        <div className="flex-1 min-w-32.5 max-w-50">
          <Label className="text-xs mb-1 block">{t("scaleLabel", { value: scale })}</Label>
          <Slider value={[scale]} onValueChange={(v) => setScale(Array.isArray(v) ? v[0] : v)} min={1} max={12} step={0.5} />
        </div>
        <div className="flex-1 min-w-32.5 max-w-50">
          <Label className="text-xs mb-1 block">{t("octavesLabel", { value: octaves })}</Label>
          <Slider value={[octaves]} onValueChange={(v) => setOctaves(Array.isArray(v) ? v[0] : v)} min={1} max={8} step={1} />
        </div>
        <Button size="sm" variant="outline" onClick={() => setSeed((s) => (s % 9999) + 1)}>
          {t("newTerrain")}
        </Button>
        {blob && <DownloadButton data={blob} filename="terrain.png" label={t("downloadPng")} />}
      </div>

      <canvas
        ref={canvasRef}
        className="rounded-lg border border-border w-full max-w-150"
        style={{ aspectRatio: "3/2" }}
      />

      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        {([
          { key: "deepWater", color: "bg-blue-900" },
          { key: "shallow", color: "bg-blue-500" },
          { key: "sand", color: "bg-yellow-200" },
          { key: "grass", color: "bg-green-600" },
          { key: "rock", color: "bg-stone-600" },
          { key: "snow", color: "bg-slate-100" },
        ] as const).map(({ key, color }) => (
          <span key={key} className="flex items-center gap-1">
            <span className={`inline-block h-3 w-3 rounded-sm border border-border ${color}`} />
            {t(key)}
          </span>
        ))}
      </div>
    </div>
  );
}
