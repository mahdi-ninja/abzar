"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DownloadButton } from "@/components/ui/download-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

type Tool = "pencil" | "eraser" | "fill";

const PALETTE = [
  "#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff", "#ffff00",
  "#ff00ff", "#00ffff", "#ff8800", "#8800ff", "#0088ff", "#88ff00",
  "#ff0088", "#008888", "#884400", "#888888",
];

export default function PixelArt() {
  const t = useTranslations("pixelArt");
  const [gridSize, setGridSize] = useState(16);
  const [pixels, setPixels] = useState<string[]>(() => Array(16 * 16).fill(""));
  const [color, setColor] = useState("#000000");
  const [tool, setTool] = useState<Tool>("pencil");
  const [painting, setPainting] = useState(false);
  const [history, setHistory] = useState<string[][]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const [exportBlob, setExportBlob] = useState<Blob | null>(null);

  const initGrid = useCallback((size: number) => {
    setGridSize(size);
    setPixels(Array(size * size).fill(""));
    setHistory([]);
    setExportBlob(null);
  }, []);

  const saveHistory = useCallback(() => {
    setHistory((prev) => [...prev.slice(-50), [...pixels]]);
  }, [pixels]);

  const importImage = useCallback(
    (file: File) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = gridSize;
        canvas.height = gridSize;
        const ctx = canvas.getContext("2d")!;
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(img, 0, 0, gridSize, gridSize);
        const imageData = ctx.getImageData(0, 0, gridSize, gridSize);
        const newPixels: string[] = [];
        for (let i = 0; i < gridSize * gridSize; i++) {
          const offset = i * 4;
          const r = imageData.data[offset];
          const g = imageData.data[offset + 1];
          const b = imageData.data[offset + 2];
          const a = imageData.data[offset + 3];
          if (a < 20) {
            newPixels.push("");
          } else {
            newPixels.push(
              `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
            );
          }
        }
        saveHistory();
        setPixels(newPixels);
        URL.revokeObjectURL(img.src);
      };
      img.src = URL.createObjectURL(file);
    },
    [gridSize, saveHistory]
  );

  const undo = useCallback(() => {
    setHistory((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setPixels(last);
      return prev.slice(0, -1);
    });
  }, []);

  const floodFill = useCallback(
    (startIdx: number, targetColor: string, fillColor: string) => {
      if (targetColor === fillColor) return;
      const newPixels = [...pixels];
      const stack = [startIdx];
      while (stack.length > 0) {
        const idx = stack.pop()!;
        if (idx < 0 || idx >= gridSize * gridSize) continue;
        if (newPixels[idx] !== targetColor) continue;
        newPixels[idx] = fillColor;
        const row = Math.floor(idx / gridSize);
        const col = idx % gridSize;
        if (col > 0) stack.push(idx - 1);
        if (col < gridSize - 1) stack.push(idx + 1);
        if (row > 0) stack.push(idx - gridSize);
        if (row < gridSize - 1) stack.push(idx + gridSize);
      }
      setPixels(newPixels);
    },
    [pixels, gridSize]
  );

  const handlePixel = useCallback(
    (idx: number) => {
      if (tool === "fill") {
        floodFill(idx, pixels[idx], color);
        return;
      }
      const newColor = tool === "eraser" ? "" : color;
      if (pixels[idx] === newColor) return;
      setPixels((prev) => {
        const next = [...prev];
        next[idx] = newColor;
        return next;
      });
    },
    [tool, color, pixels, floodFill]
  );

  const handleMouseDown = useCallback(
    (idx: number) => {
      saveHistory(); // Save once at start of stroke
      setPainting(true);
      handlePixel(idx);
    },
    [handlePixel, saveHistory]
  );

  const handleMouseEnter = useCallback(
    (idx: number) => {
      if (!painting || tool === "fill") return;
      const newColor = tool === "eraser" ? "" : color;
      setPixels((prev) => {
        const next = [...prev];
        next[idx] = newColor;
        return next;
      });
    },
    [painting, tool, color]
  );

  // Export to PNG
  useEffect(() => {
    if (!canvasRef.current) return;
    const scale = 16;
    const canvas = canvasRef.current;
    canvas.width = gridSize * scale;
    canvas.height = gridSize * scale;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < pixels.length; i++) {
      if (pixels[i]) {
        const row = Math.floor(i / gridSize);
        const col = i % gridSize;
        ctx.fillStyle = pixels[i];
        ctx.fillRect(col * scale, row * scale, scale, scale);
      }
    }
    canvas.toBlob((blob) => {
      if (blob) setExportBlob(blob);
    }, "image/png");
  }, [pixels, gridSize]);

  const cellSize = Math.max(8, Math.min(32, Math.floor(400 / gridSize)));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <Label className="text-xs mb-1 block">{t("grid")}</Label>
          <Select value={String(gridSize)} onValueChange={(v) => v && initGrid(Number(v))}>
            <SelectTrigger className="w-24 text-sm">
              <span>{gridSize}x{gridSize}</span>
            </SelectTrigger>
            <SelectContent>
              {[8, 16, 24, 32].map((s) => (
                <SelectItem key={s} value={String(s)}>{s}x{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs mb-1 block">{t("tool")}</Label>
          <div className="flex gap-1">
            {(["pencil", "eraser", "fill"] as const).map((toolName) => (
              <Button
                key={toolName}
                size="sm"
                variant={tool === toolName ? "default" : "outline"}
                onClick={() => setTool(toolName)}
                className="h-8 text-xs"
              >
                {t(toolName)}
              </Button>
            ))}
          </div>
        </div>

        <Button size="sm" variant="outline" onClick={undo} disabled={history.length === 0}>
          {t("undo")}
        </Button>
        <Button size="sm" variant="outline" onClick={() => importInputRef.current?.click()}>
          {t("importImage")}
        </Button>
        <input
          ref={importInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) importImage(file);
            e.target.value = "";
          }}
        />
        <Button size="sm" variant="outline" onClick={() => initGrid(gridSize)}>
          {t("clear")}
        </Button>
        {exportBlob && (
          <DownloadButton data={exportBlob} filename="pixel-art.png" label={t("exportPng")} />
        )}
      </div>

      {/* Color palette */}
      <div className="flex flex-wrap gap-1 items-center">
        {PALETTE.map((c) => (
          <button
            key={c}
            className={`h-7 w-7 rounded border-2 ${color === c ? "border-primary ring-2 ring-primary/30" : "border-transparent"}`}
            style={{ backgroundColor: c }}
            onClick={() => setColor(c)}
            aria-label={t("selectColor", { color: c })}
          />
        ))}
        <Input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="h-7 w-9 p-0 cursor-pointer rounded border"
        />
      </div>

      {/* Grid */}
      <div
        className="inline-grid border border-border bg-[repeating-conic-gradient(#e5e7eb_0%_25%,#fff_0%_50%)] dark:bg-[repeating-conic-gradient(#333_0%_25%,#222_0%_50%)]"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
          backgroundSize: `${cellSize * 2}px ${cellSize * 2}px`,
        }}
        onMouseLeave={() => setPainting(false)}
        onMouseUp={() => setPainting(false)}
      >
        {pixels.map((px, i) => (
          <div
            key={i}
            className="border-[0.5px] border-border/20"
            style={{
              width: cellSize,
              height: cellSize,
              backgroundColor: px || "transparent",
            }}
            onMouseDown={() => handleMouseDown(i)}
            onMouseEnter={() => handleMouseEnter(i)}
          />
        ))}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
