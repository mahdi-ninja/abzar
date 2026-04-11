"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { FileDropZone } from "@/components/ui/file-drop-zone";
import { DownloadButton } from "@/components/ui/download-button";
import { Card } from "@/components/ui/card";

export default function ImageResizer() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [fileName, setFileName] = useState("");
  const [origWidth, setOrigWidth] = useState(0);
  const [origHeight, setOrigHeight] = useState(0);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [lockAspect, setLockAspect] = useState(true);
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileUpload = useCallback((files: File[]) => {
    const file = files[0];
    setFileName(file.name);
    const img = new Image();
    img.onload = () => {
      setImage(img);
      setOrigWidth(img.naturalWidth);
      setOrigHeight(img.naturalHeight);
      setWidth(img.naturalWidth);
      setHeight(img.naturalHeight);
    };
    img.src = URL.createObjectURL(file);
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

  const handleResize = useCallback(() => {
    if (!image || !canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(image, 0, 0, width, height);
    canvas.toBlob(
      (blob) => {
        if (blob) setOutputBlob(blob);
      },
      "image/png"
    );
  }, [image, width, height]);

  // Auto-resize when dimensions change
  useEffect(() => {
    if (image && width > 0 && height > 0) {
      handleResize();
    }
  }, [image, width, height, handleResize]);

  const handleReset = useCallback(() => {
    if (origWidth && origHeight) {
      setWidth(origWidth);
      setHeight(origHeight);
    }
  }, [origWidth, origHeight]);

  const handleHalf = useCallback(() => {
    handleWidthChange(Math.round(origWidth / 2));
  }, [origWidth, handleWidthChange]);

  const handleQuarter = useCallback(() => {
    handleWidthChange(Math.round(origWidth / 4));
  }, [origWidth, handleWidthChange]);

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
          {/* Controls */}
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <Label className="text-sm mb-1 block">Width (px)</Label>
              <Input
                type="number"
                min={1}
                value={width}
                onChange={(e) => handleWidthChange(Number(e.target.value))}
                className="w-28"
              />
            </div>
            <div>
              <Label className="text-sm mb-1 block">Height (px)</Label>
              <Input
                type="number"
                min={1}
                value={height}
                onChange={(e) => handleHeightChange(Number(e.target.value))}
                className="w-28"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <Switch
                checked={lockAspect}
                onCheckedChange={setLockAspect}
              />
              <Label className="text-xs">Lock aspect ratio</Label>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={handleReset}>
              Original ({origWidth}x{origHeight})
            </Button>
            <Button size="sm" variant="secondary" onClick={handleHalf}>
              50%
            </Button>
            <Button size="sm" variant="secondary" onClick={handleQuarter}>
              25%
            </Button>
            {outputBlob && (
              <DownloadButton
                data={outputBlob}
                filename={`resized-${fileName}`}
                label="Download"
              />
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setImage(null);
                setOutputBlob(null);
                setFileName("");
              }}
            >
              Clear
            </Button>
          </div>

          {/* Preview */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card className="p-3">
              <Label className="text-xs text-muted-foreground mb-2 block">
                Original ({origWidth}x{origHeight})
              </Label>
              <img
                src={image.src}
                alt="Original"
                className="max-h-64 w-full object-contain rounded"
              />
            </Card>
            <Card className="p-3">
              <Label className="text-xs text-muted-foreground mb-2 block">
                Resized ({width}x{height})
                {outputBlob && ` — ${(outputBlob.size / 1024).toFixed(1)}KB`}
              </Label>
              <canvas
                ref={canvasRef}
                className="max-h-64 w-full object-contain rounded"
              />
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
