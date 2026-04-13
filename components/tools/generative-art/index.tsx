"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { DownloadButton } from "@/components/ui/download-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

type Algorithm = "perlin" | "circles" | "waves" | "flowfield";

const PALETTES: Record<string, string[]> = {
  Sunset: ["#2d1b69", "#11998e", "#38ef7d", "#f9d423", "#ff4e50"],
  Ocean: ["#0a192f", "#1e3a5f", "#2980b9", "#5dade2", "#aed6f1"],
  Forest: ["#1a1a2e", "#0f3460", "#533483", "#2ecc71", "#a8e6cf"],
  Fire: ["#1a0000", "#7b2d00", "#cc4e00", "#ff8c00", "#ffd700"],
  Mono: ["#000000", "#333333", "#666666", "#999999", "#cccccc"],
};

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

function fade(t: number) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}
function lerp(a: number, b: number, t: number) {
  return a + t * (b - a);
}
function grad(h: number, x: number, y: number) {
  return ((h & 1) ? -x : x) + ((h & 2) ? -y : y);
}
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

function parseHex(hex: string): [number, number, number] {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
}

function drawPerlin(ctx: CanvasRenderingContext2D, w: number, h: number, seed: number, scale: number, pal: string[]) {
  const perm = buildPerm(seed);
  const img = ctx.createImageData(w, h);
  const cols = pal.map(parseHex);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const v = (noise(perm, x / scale, y / scale) + 1) / 2;
      const ci = Math.min(Math.floor(v * cols.length), cols.length - 1);
      const i = (y * w + x) * 4;
      [img.data[i], img.data[i + 1], img.data[i + 2]] = cols[ci];
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
}

function drawCircles(ctx: CanvasRenderingContext2D, w: number, h: number, seed: number, count: number, pal: string[]) {
  const rand = seededRng(seed);
  ctx.fillStyle = pal[0];
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < count; i++) {
    ctx.beginPath();
    ctx.arc(rand() * w, rand() * h, rand() * 80 + 8, 0, Math.PI * 2);
    ctx.fillStyle = pal[Math.floor(rand() * pal.length)] + "99";
    ctx.fill();
  }
}

function drawWaves(ctx: CanvasRenderingContext2D, w: number, h: number, seed: number, scale: number, pal: string[]) {
  const perm = buildPerm(seed);
  ctx.fillStyle = pal[0];
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 24; i++) {
    ctx.beginPath();
    ctx.strokeStyle = pal[i % pal.length] + "cc";
    ctx.lineWidth = 2;
    for (let x = 0; x <= w; x += 2) {
      const y = h * (i / 24) + noise(perm, x / scale, i * 0.4) * 80;
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

function drawFlowField(ctx: CanvasRenderingContext2D, w: number, h: number, seed: number, scale: number, pal: string[]) {
  const perm = buildPerm(seed);
  const rand = seededRng(seed + 1);
  ctx.fillStyle = pal[0];
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 600; i++) {
    let x = rand() * w, y = rand() * h;
    ctx.beginPath();
    ctx.strokeStyle = pal[Math.floor(rand() * pal.length)] + "77";
    ctx.lineWidth = 1;
    ctx.moveTo(x, y);
    for (let s = 0; s < 80; s++) {
      const a = noise(perm, x / scale, y / scale) * Math.PI * 4;
      x += Math.cos(a) * 2; y += Math.sin(a) * 2;
      if (x < 0 || x > w || y < 0 || y > h) break;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

const ALGO_LABELS: Record<Algorithm, string> = {
  perlin: "Perlin Noise",
  circles: "Circles",
  waves: "Waves",
  flowfield: "Flow Field",
};

export default function GenerativeArt() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [algorithm, setAlgorithm] = useState<Algorithm>("perlin");
  const [palette, setPalette] = useState("Sunset");
  const [seed, setSeed] = useState(42);
  const [scale, setScale] = useState(80);
  const [blob, setBlob] = useState<Blob | null>(null);
  // Cancels the previous rAF when slider fires rapidly, preventing a queue
  // of heavy synchronous canvas renders from freezing the UI thread
  const rafRef = useRef<number | null>(null);

  const generate = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const W = 600, H = 400;
      canvas.width = W; canvas.height = H;
      const colors = PALETTES[palette];
      if (algorithm === "perlin") drawPerlin(ctx, W, H, seed, scale, colors);
      else if (algorithm === "circles") drawCircles(ctx, W, H, seed, Math.round(scale * 1.5), colors);
      else if (algorithm === "waves") drawWaves(ctx, W, H, seed, scale, colors);
      else drawFlowField(ctx, W, H, seed, scale, colors);
      canvas.toBlob((b) => b && setBlob(b));
    });
  }, [algorithm, palette, seed, scale]);

  useEffect(() => { generate(); }, [generate]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <Label className="text-xs mb-1 block">Algorithm</Label>
          <Select value={algorithm} onValueChange={(v) => v && setAlgorithm(v as Algorithm)}>
            <SelectTrigger className="w-36"><span>{ALGO_LABELS[algorithm]}</span></SelectTrigger>
            <SelectContent>
              {(Object.keys(ALGO_LABELS) as Algorithm[]).map((a) => (
                <SelectItem key={a} value={a}>{ALGO_LABELS[a]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs mb-1 block">Palette</Label>
          <Select value={palette} onValueChange={(v) => v && setPalette(v)}>
            <SelectTrigger className="w-32"><span>{palette}</span></SelectTrigger>
            <SelectContent>
              {Object.keys(PALETTES).map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 min-w-[140px] max-w-[200px]">
          <Label className="text-xs mb-1 block">Scale: {scale}</Label>
          <Slider value={[scale]} onValueChange={(v) => setScale(Array.isArray(v) ? v[0] : v)} min={20} max={200} step={5} />
        </div>
        <div className="flex-1 min-w-[130px] max-w-[180px]">
          <Label className="text-xs mb-1 block">Seed: {seed}</Label>
          <Slider value={[seed]} onValueChange={(v) => setSeed(Array.isArray(v) ? v[0] : v)} min={1} max={999} step={1} />
        </div>
        <Button size="sm" variant="outline" onClick={() => setSeed((s) => (s % 999) + 1)}>
          Randomize
        </Button>
        {blob && <DownloadButton data={blob} filename="generative-art.png" label="Download PNG" />}
      </div>
      <canvas
        ref={canvasRef}
        className="rounded-lg border border-border w-full max-w-[600px]"
        style={{ aspectRatio: "3/2" }}
      />
    </div>
  );
}
