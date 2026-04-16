"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { DownloadButton } from "@/components/ui/download-button";

type DrawTool = "brush" | "eraser";

const PALETTE = [
  "#000000", "#ffffff", "#ef4444", "#f97316", "#eab308",
  "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6",
  "#6b7280", "#d97706",
];

export default function DrawingCanvas() {
  const t = useTranslations("drawingCanvas");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<DrawTool>("brush");
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(8);
  // drawingRef is read synchronously in event handlers to avoid stale closure
  // setDrawing keeps the React state in sync for UI (e.g. button styling)
  const drawingRef = useRef(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [blob, setBlob] = useState<Blob | null>(null);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  // Initialize canvas on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 800;
    canvas.height = 500;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e && e.touches.length > 0) {
      const t = e.touches[0];
      return { x: (t.clientX - rect.left) * scaleX, y: (t.clientY - rect.top) * scaleY };
    }
    if ("clientX" in e) {
      return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
    }
    return lastPos.current ?? { x: 0, y: 0 };
  };

  const saveHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(-30), data]);
  }, []);

  const startDraw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    saveHistory();
    drawingRef.current = true;
    lastPos.current = getPos(e, canvas);
  }, [saveHistory]);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    // Use the ref (not React state) to avoid stale closure dropping the first segment
    if (!drawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = tool === "eraser" ? "#ffffff" : color;
    ctx.moveTo(lastPos.current?.x ?? pos.x, lastPos.current?.y ?? pos.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
    // toBlob is NOT called here — calling it on every mousemove queues
    // hundreds of async state updates per stroke, causing jank. It is
    // called once in stopDraw after the full stroke is committed.
  }, [brushSize, tool, color]);

  const stopDraw = useCallback(() => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    lastPos.current = null;
    // Compute the export blob once per completed stroke
    const canvas = canvasRef.current;
    if (canvas) canvas.toBlob((b) => b && setBlob(b));
  }, []);

  const undo = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || history.length === 0) return;
    const ctx = canvas.getContext("2d")!;
    const prev = history[history.length - 1];
    ctx.putImageData(prev, 0, 0);
    setHistory((h) => h.slice(0, -1));
    canvas.toBlob((b) => b && setBlob(b));
  }, [history]);

  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    saveHistory();
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setBlob(null);
  }, [saveHistory]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex gap-1">
          {(["brush", "eraser"] as DrawTool[]).map((dt) => (
            <Button
              key={dt}
              size="sm"
              variant={tool === dt ? "default" : "outline"}
              onClick={() => setTool(dt)}
            >
              {dt === "brush" ? "✏️" : "⬜"} {t(dt)}
            </Button>
          ))}
        </div>
        <div className="w-40">
          <Label className="text-xs mb-1 block">{t("sizeLabel", { value: brushSize })}</Label>
          <Slider value={[brushSize]} onValueChange={(v) => setBrushSize(Array.isArray(v) ? v[0] : v)} min={1} max={60} step={1} />
        </div>
        <Button size="sm" variant="outline" onClick={undo} disabled={history.length === 0}>
          {t("undo")}
        </Button>
        <Button size="sm" variant="outline" onClick={clear}>
          {t("clear")}
        </Button>
        {blob && <DownloadButton data={blob} filename="drawing.png" label={t("downloadPng")} />}
      </div>

      <div className="flex flex-wrap gap-1 items-center">
        {PALETTE.map((c) => (
          <button
            key={c}
            className={`h-7 w-7 rounded border-2 transition-transform ${color === c && tool === "brush" ? "border-primary scale-110 ring-2 ring-primary/30" : "border-border"}`}
            style={{ backgroundColor: c }}
            onClick={() => { setColor(c); setTool("brush"); }}
            aria-label={`Color ${c}`}
          />
        ))}
        <Input
          type="color"
          value={color}
          onChange={(e) => { setColor(e.target.value); setTool("brush"); }}
          className="h-7 w-9 p-0.5 cursor-pointer rounded border"
          title={t("customColor")}
        />
      </div>

      <div
        className="overflow-auto rounded-lg border border-border select-none touch-none"
        style={{ maxWidth: "100%" }}
      >
        <canvas
          ref={canvasRef}
          style={{ display: "block", maxWidth: "100%", touchAction: "none", cursor: tool === "eraser" ? "cell" : "crosshair" }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
        />
      </div>
    </div>
  );
}
