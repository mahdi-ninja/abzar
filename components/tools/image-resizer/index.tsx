"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileDropZone } from "@/components/ui/file-drop-zone";
import { DownloadButton } from "@/components/ui/download-button";
import { Card } from "@/components/ui/card";

type Mode = "resize" | "crop";
type DragAction =
  | { type: "none" }
  | { type: "draw"; startX: number; startY: number }
  | { type: "move"; offsetX: number; offsetY: number }
  | { type: "resize"; handle: Handle; startCrop: CropRect };

type Handle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

interface CropRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const HANDLE_SIZE = 8;

const HANDLE_CURSORS: Record<Handle, string> = {
  nw: "nwse-resize",
  n: "ns-resize",
  ne: "nesw-resize",
  e: "ew-resize",
  se: "nwse-resize",
  s: "ns-resize",
  sw: "nesw-resize",
  w: "ew-resize",
};

function getHandlePositions(crop: CropRect, scale: number) {
  const { x, y, w, h } = crop;
  const hs = HANDLE_SIZE / 2 / scale;
  return {
    nw: { x: x - hs, y: y - hs },
    n: { x: x + w / 2 - hs, y: y - hs },
    ne: { x: x + w - hs, y: y - hs },
    e: { x: x + w - hs, y: y + h / 2 - hs },
    se: { x: x + w - hs, y: y + h - hs },
    s: { x: x + w / 2 - hs, y: y + h - hs },
    sw: { x: x - hs, y: y + h - hs },
    w: { x: x - hs, y: y + h / 2 - hs },
  };
}

function hitTestHandle(
  mx: number,
  my: number,
  crop: CropRect,
  scale: number
): Handle | null {
  const tolerance = HANDLE_SIZE / scale;
  const handles = getHandlePositions(crop, scale);
  for (const [key, pos] of Object.entries(handles)) {
    if (
      mx >= pos.x - tolerance / 2 &&
      mx <= pos.x + tolerance * 1.5 &&
      my >= pos.y - tolerance / 2 &&
      my <= pos.y + tolerance * 1.5
    ) {
      return key as Handle;
    }
  }
  return null;
}

function hitTestInside(mx: number, my: number, crop: CropRect): boolean {
  return mx >= crop.x && mx <= crop.x + crop.w && my >= crop.y && my <= crop.y + crop.h;
}

export default function ImageResizer() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [fileName, setFileName] = useState("");
  const [origWidth, setOrigWidth] = useState(0);
  const [origHeight, setOrigHeight] = useState(0);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [lockAspect, setLockAspect] = useState(true);
  const [mode, setMode] = useState<Mode>("resize");
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const outputCanvasRef = useRef<HTMLCanvasElement>(null);

  // Crop state
  const [crop, setCrop] = useState<CropRect>({ x: 0, y: 0, w: 0, h: 0 });
  const cropCanvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<DragAction>({ type: "none" });
  const [displayScale, setDisplayScale] = useState(1);
  const [cursorStyle, setCursorStyle] = useState("crosshair");

  const objectUrlRef = useRef<string | null>(null);

  const handleFileUpload = useCallback((files: File[]) => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const file = files[0];
    setFileName(file.name);
    const img = new Image();
    img.onload = () => {
      setImage(img);
      setOrigWidth(img.naturalWidth);
      setOrigHeight(img.naturalHeight);
      setWidth(img.naturalWidth);
      setHeight(img.naturalHeight);
      setCrop({ x: 0, y: 0, w: img.naturalWidth, h: img.naturalHeight });
    };
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    img.src = url;
  }, []);

  const handleWidthChange = useCallback(
    (newWidth: number) => {
      setWidth(newWidth);
      if (lockAspect && origWidth > 0) {
        setHeight(Math.round((newWidth / origWidth) * origHeight));
      }
    },
    [lockAspect, origWidth, origHeight]
  );

  const handleHeightChange = useCallback(
    (newHeight: number) => {
      setHeight(newHeight);
      if (lockAspect && origHeight > 0) {
        setWidth(Math.round((newHeight / origHeight) * origWidth));
      }
    },
    [lockAspect, origWidth, origHeight]
  );

  // Render output for resize mode
  useEffect(() => {
    if (!image || !outputCanvasRef.current || mode !== "resize") return;
    if (width <= 0 || height <= 0) return;
    const canvas = outputCanvasRef.current;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(image, 0, 0, width, height);
    canvas.toBlob((blob) => {
      if (blob) setOutputBlob(blob);
    }, "image/png");
  }, [image, width, height, mode]);

  // Revoke object URL on unmount
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  // Draw crop overlay
  useEffect(() => {
    if (!image || !cropCanvasRef.current || mode !== "crop") return;
    const canvas = cropCanvasRef.current;
    const maxW = canvas.parentElement?.clientWidth ?? 500;
    const scale = Math.min(1, maxW / origWidth);
    setDisplayScale(scale);
    canvas.width = origWidth * scale;
    canvas.height = origHeight * scale;
    const ctx = canvas.getContext("2d")!;

    // Draw full image
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // Dim outside crop
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw crop area
    const sx = crop.x * scale;
    const sy = crop.y * scale;
    const sw = crop.w * scale;
    const sh = crop.h * scale;
    ctx.clearRect(sx, sy, sw, sh);
    ctx.drawImage(image, crop.x, crop.y, crop.w, crop.h, sx, sy, sw, sh);

    // Crop border
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 2;
    ctx.strokeRect(sx, sy, sw, sh);

    // Rule of thirds
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 1;
    for (let i = 1; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(sx + (sw * i) / 3, sy);
      ctx.lineTo(sx + (sw * i) / 3, sy + sh);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(sx, sy + (sh * i) / 3);
      ctx.lineTo(sx + sw, sy + (sh * i) / 3);
      ctx.stroke();
    }

    // Resize handles
    if (crop.w > 10 && crop.h > 10) {
      const handles = getHandlePositions(crop, scale);
      ctx.fillStyle = "#f59e0b";
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 1;
      for (const pos of Object.values(handles)) {
        const hx = pos.x * scale;
        const hy = pos.y * scale;
        ctx.fillRect(hx, hy, HANDLE_SIZE, HANDLE_SIZE);
        ctx.strokeRect(hx, hy, HANDLE_SIZE, HANDLE_SIZE);
      }
    }
  }, [image, mode, origWidth, origHeight, crop]);

  // Apply crop to output
  const applyCrop = useCallback(() => {
    if (!image || !outputCanvasRef.current || crop.w < 1 || crop.h < 1) return;
    const canvas = outputCanvasRef.current;
    canvas.width = crop.w;
    canvas.height = crop.h;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(image, crop.x, crop.y, crop.w, crop.h, 0, 0, crop.w, crop.h);
    canvas.toBlob((blob) => {
      if (blob) setOutputBlob(blob);
    }, "image/png");
  }, [image, crop]);

  // Get mouse position in image coordinates
  const getImageCoords = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      return {
        x: (e.clientX - rect.left) / displayScale,
        y: (e.clientY - rect.top) / displayScale,
      };
    },
    [displayScale]
  );

  const clampCrop = useCallback(
    (c: CropRect): CropRect => ({
      x: Math.max(0, Math.min(c.x, origWidth - 1)),
      y: Math.max(0, Math.min(c.y, origHeight - 1)),
      w: Math.max(1, Math.min(c.w, origWidth - Math.max(0, c.x))),
      h: Math.max(1, Math.min(c.h, origHeight - Math.max(0, c.y))),
    }),
    [origWidth, origHeight]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const { x, y } = getImageCoords(e);

      // Check handles first
      const handle = hitTestHandle(x, y, crop, displayScale);
      if (handle) {
        dragRef.current = { type: "resize", handle, startCrop: { ...crop } };
        return;
      }

      // Check inside crop
      if (hitTestInside(x, y, crop) && crop.w > 5 && crop.h > 5) {
        dragRef.current = { type: "move", offsetX: x - crop.x, offsetY: y - crop.y };
        return;
      }

      // Start new selection
      dragRef.current = { type: "draw", startX: x, startY: y };
      setCrop({ x: Math.round(x), y: Math.round(y), w: 0, h: 0 });
    },
    [getImageCoords, crop, displayScale]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const { x, y } = getImageCoords(e);
      const action = dragRef.current;

      if (action.type === "none") {
        // Update cursor based on hover
        const handle = hitTestHandle(x, y, crop, displayScale);
        if (handle) {
          setCursorStyle(HANDLE_CURSORS[handle]);
        } else if (hitTestInside(x, y, crop) && crop.w > 5 && crop.h > 5) {
          setCursorStyle("move");
        } else {
          setCursorStyle("crosshair");
        }
        return;
      }

      if (action.type === "draw") {
        const newX = Math.max(0, Math.min(action.startX, x));
        const newY = Math.max(0, Math.min(action.startY, y));
        const newW = Math.abs(x - action.startX);
        const newH = Math.abs(y - action.startY);
        setCrop(clampCrop({ x: newX, y: newY, w: newW, h: newH }));
      }

      if (action.type === "move") {
        setCrop((prev) =>
          clampCrop({
            ...prev,
            x: x - action.offsetX,
            y: y - action.offsetY,
          })
        );
      }

      if (action.type === "resize") {
        const { handle, startCrop: sc } = action;
        let nx = sc.x, ny = sc.y, nw = sc.w, nh = sc.h;

        if (handle.includes("w")) {
          nw = sc.x + sc.w - x;
          nx = x;
        }
        if (handle.includes("e")) {
          nw = x - sc.x;
        }
        if (handle.includes("n")) {
          nh = sc.y + sc.h - y;
          ny = y;
        }
        if (handle.includes("s")) {
          nh = y - sc.y;
        }

        // Prevent negative dimensions by flipping
        if (nw < 0) { nx += nw; nw = -nw; }
        if (nh < 0) { ny += nh; nh = -nh; }

        setCrop(clampCrop({ x: nx, y: ny, w: nw, h: nh }));
      }
    },
    [getImageCoords, crop, displayScale, clampCrop]
  );

  const handleMouseUp = useCallback(() => {
    dragRef.current = { type: "none" };
    setCrop((prev) => ({
      x: Math.round(prev.x),
      y: Math.round(prev.y),
      w: Math.round(prev.w),
      h: Math.round(prev.h),
    }));
  }, []);

  return (
    <div className="space-y-6">
      {!image ? (
        <FileDropZone
          onFiles={handleFileUpload}
          accept="image/*"
          label="Drop an image here to get started"
          className="min-h-[200px]"
        />
      ) : (
        <>
          <Tabs value={mode} onValueChange={(v) => { setMode(v as Mode); setOutputBlob(null); }}>
            <TabsList className="h-8">
              <TabsTrigger value="resize" className="text-xs px-3 h-6">Resize</TabsTrigger>
              <TabsTrigger value="crop" className="text-xs px-3 h-6">Crop</TabsTrigger>
            </TabsList>
          </Tabs>

          {mode === "resize" && (
            <>
              <div className="flex flex-wrap items-end gap-4">
                <div>
                  <Label className="text-sm mb-1 block">Width (px)</Label>
                  <Input type="number" min={1} value={width}
                    onChange={(e) => handleWidthChange(Number(e.target.value))} className="w-28" />
                </div>
                <div>
                  <Label className="text-sm mb-1 block">Height (px)</Label>
                  <Input type="number" min={1} value={height}
                    onChange={(e) => handleHeightChange(Number(e.target.value))} className="w-28" />
                </div>
                <div className="flex items-center gap-1.5">
                  <Switch checked={lockAspect} onCheckedChange={setLockAspect} />
                  <Label className="text-xs">Lock aspect ratio</Label>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" onClick={() => { setWidth(origWidth); setHeight(origHeight); }}>
                  Original ({origWidth}x{origHeight})
                </Button>
                <Button size="sm" variant="secondary" onClick={() => handleWidthChange(Math.round(origWidth / 2))}>
                  50%
                </Button>
                <Button size="sm" variant="secondary" onClick={() => handleWidthChange(Math.round(origWidth / 4))}>
                  25%
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Card className="p-3">
                  <Label className="text-xs text-muted-foreground mb-2 block">
                    Original ({origWidth}x{origHeight})
                  </Label>
                  <img src={image.src} alt="Original" className="max-h-64 w-full object-contain rounded" />
                </Card>
                <Card className="p-3">
                  <Label className="text-xs text-muted-foreground mb-2 block">
                    Resized ({width}x{height})
                    {outputBlob && ` — ${(outputBlob.size / 1024).toFixed(1)}KB`}
                  </Label>
                  <canvas ref={outputCanvasRef} className="max-h-64 w-full object-contain rounded" />
                </Card>
              </div>
            </>
          )}

          {mode === "crop" && (
            <>
              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <Label className="text-xs mb-1 block">X</Label>
                  <Input type="number" min={0} max={origWidth} value={Math.round(crop.x)}
                    onChange={(e) => setCrop((p) => clampCrop({ ...p, x: Number(e.target.value) }))} className="w-20 text-sm" />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Y</Label>
                  <Input type="number" min={0} max={origHeight} value={Math.round(crop.y)}
                    onChange={(e) => setCrop((p) => clampCrop({ ...p, y: Number(e.target.value) }))} className="w-20 text-sm" />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Width</Label>
                  <Input type="number" min={1} value={Math.round(crop.w)}
                    onChange={(e) => setCrop((p) => clampCrop({ ...p, w: Number(e.target.value) }))} className="w-20 text-sm" />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Height</Label>
                  <Input type="number" min={1} value={Math.round(crop.h)}
                    onChange={(e) => setCrop((p) => clampCrop({ ...p, h: Number(e.target.value) }))} className="w-20 text-sm" />
                </div>
                <Button size="sm" onClick={applyCrop} disabled={crop.w < 1 || crop.h < 1}>
                  Apply Crop
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                Draw a selection, then drag to move or pull handles to resize.
              </p>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Card className="p-3">
                  <Label className="text-xs text-muted-foreground mb-2 block">
                    Select crop area
                  </Label>
                  <canvas
                    ref={cropCanvasRef}
                    className="w-full rounded select-none"
                    style={{ cursor: cursorStyle }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  />
                </Card>
                <Card className="p-3">
                  <Label className="text-xs text-muted-foreground mb-2 block">
                    Cropped result
                    {outputBlob && ` (${Math.round(crop.w)}x${Math.round(crop.h)}) — ${(outputBlob.size / 1024).toFixed(1)}KB`}
                  </Label>
                  <canvas ref={outputCanvasRef} className="max-h-64 w-full object-contain rounded" />
                </Card>
              </div>
            </>
          )}

          <div className="flex flex-wrap gap-2">
            {outputBlob && (
              <DownloadButton
                data={outputBlob}
                filename={`${mode === "crop" ? "cropped" : "resized"}-${fileName}`}
                label="Download"
              />
            )}
            <Button size="sm" variant="outline" onClick={() => { if (objectUrlRef.current) { URL.revokeObjectURL(objectUrlRef.current); objectUrlRef.current = null; } setImage(null); setOutputBlob(null); setFileName(""); }}>
              Clear
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
