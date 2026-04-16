"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { DownloadButton } from "@/components/ui/download-button";
import { FileDropZone } from "@/components/ui/file-drop-zone";

export default function MemeGenerator() {
  const t = useTranslations("memeGenerator");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [topText, setTopText] = useState("WHEN YOU");
  const [bottomText, setBottomText] = useState("FINALLY GET IT");
  const [fontSize, setFontSize] = useState(42);
  const [textColor, setTextColor] = useState("#ffffff");
  const [blob, setBlob] = useState<Blob | null>(null);

  // Revoke the blob URL whenever it changes (handles both "Change Image" and unmount)
  useEffect(() => {
    return () => {
      if (imgUrl) URL.revokeObjectURL(imgUrl);
    };
  }, [imgUrl]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imgUrl) return;
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const size = Math.min(fontSize, Math.floor(canvas.width / 10));
      ctx.font = `bold ${size}px Impact, Arial Black, sans-serif`;
      ctx.textAlign = "center";
      ctx.lineWidth = Math.max(2, size / 12);
      ctx.strokeStyle = "#000000";
      ctx.fillStyle = textColor;
      const cx = canvas.width / 2;
      if (topText.trim()) {
        ctx.strokeText(topText.toUpperCase(), cx, size + 10);
        ctx.fillText(topText.toUpperCase(), cx, size + 10);
      }
      if (bottomText.trim()) {
        ctx.strokeText(bottomText.toUpperCase(), cx, canvas.height - 16);
        ctx.fillText(bottomText.toUpperCase(), cx, canvas.height - 16);
      }
      canvas.toBlob((b) => b && setBlob(b));
    };
    img.src = imgUrl;
  }, [imgUrl, topText, bottomText, fontSize, textColor]);

  useEffect(() => { render(); }, [render]);

  const handleFiles = useCallback((files: File[]) => {
    const file = files[0];
    if (!file) return;
    // Set new URL; the cleanup effect for the previous imgUrl will revoke it
    setImgUrl(URL.createObjectURL(file));
  }, []);

  if (!imgUrl) {
    return (
      <FileDropZone
        accept="image/*"
        onFiles={handleFiles}
        label={t("dropLabel")}
        maxSizeMB={20}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-40">
          <Label className="text-xs mb-1 block">{t("topText")}</Label>
          <Input value={topText} onChange={(e) => setTopText(e.target.value)} placeholder={`${t("topText")}…`} />
        </div>
        <div className="flex-1 min-w-40">
          <Label className="text-xs mb-1 block">{t("bottomText")}</Label>
          <Input value={bottomText} onChange={(e) => setBottomText(e.target.value)} placeholder={`${t("bottomText")}…`} />
        </div>
        <div className="w-40">
          <Label className="text-xs mb-1 block">{t("fontSizeLabel", { value: fontSize })}</Label>
          <Slider value={[fontSize]} onValueChange={(v) => setFontSize(Array.isArray(v) ? v[0] : v)} min={16} max={100} step={2} />
        </div>
        <div>
          <Label className="text-xs mb-1 block">{t("textColor")}</Label>
          <Input
            type="color"
            value={textColor}
            onChange={(e) => setTextColor(e.target.value)}
            className="w-12 h-9 p-1 cursor-pointer"
          />
        </div>
        {/* setImgUrl(null) triggers the useEffect cleanup which revokes the URL */}
        <Button size="sm" variant="outline" onClick={() => setImgUrl(null)}>
          {t("changeImage")}
        </Button>
        {blob && <DownloadButton data={blob} filename="meme.png" label={t("downloadPng")} />}
      </div>
      <div className="overflow-auto">
        <canvas ref={canvasRef} className="rounded-lg border border-border max-w-full" />
      </div>
    </div>
  );
}
