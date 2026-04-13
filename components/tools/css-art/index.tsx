"use client";
import { useState, useCallback, useMemo, useEffect } from "react";
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
import { toast } from "sonner";

type Algorithm = "dots" | "stripes" | "checkerboard" | "gradient-blob" | "concentric" | "wave";

const ALGO_LABELS: Record<Algorithm, string> = {
  dots: "Dots",
  stripes: "Stripes",
  checkerboard: "Checkerboard",
  "gradient-blob": "Gradient Blobs",
  concentric: "Concentric",
  wave: "Waves",
};

function generateCss(algo: Algorithm, color1: string, color2: string, size: number, complexity: number): { html: string; css: string } {
  const w = size, h = size;
  const containerCss = `width:${w}px;height:${h}px;border-radius:8px;overflow:hidden;`;

  if (algo === "dots") {
    const count = Math.floor(5 + complexity * 2);
    const stops = [];
    for (let i = 0; i < count; i++) {
      const pos = (i / count) * 100;
      const c = i % 2 === 0 ? color1 : color2;
      stops.push(`${c} ${pos}% ${pos + (100 / count) * 0.6}%`);
    }
    const bg = `radial-gradient(circle, ${stops.join(", ")})`;
    return {
      html: `<div class="art"></div>`,
      css: `.art { ${containerCss} background: ${bg}; }`,
    };
  }

  if (algo === "stripes") {
    const angle = 45;
    const width = Math.max(10, Math.floor(100 / (2 + complexity)));
    return {
      html: `<div class="art"></div>`,
      css: `.art { ${containerCss} background: repeating-linear-gradient(${angle}deg, ${color1} 0px ${width}px, ${color2} ${width}px ${width * 2}px); }`,
    };
  }

  if (algo === "checkerboard") {
    const size_sq = Math.max(10, Math.floor(100 / (1 + complexity)));
    return {
      html: `<div class="art"></div>`,
      css: `.art { ${containerCss} background-image: repeating-conic-gradient(${color1} 0% 25%, ${color2} 0% 50%); background-size: ${size_sq}px ${size_sq}px; }`,
    };
  }

  if (algo === "gradient-blob") {
    const blobs = Math.floor(2 + complexity * 0.5);
    const gradients: string[] = [];
    for (let i = 0; i < blobs; i++) {
      const x = Math.floor((i / blobs) * 100);
      const color = i % 2 === 0 ? color1 : color2;
      gradients.push(`radial-gradient(ellipse 400px 300px at ${x}% ${50 + (i % 2) * 30}%, ${color} 0%, transparent 70%)`);
    }
    return {
      html: `<div class="art"></div>`,
      css: `.art { ${containerCss} background: ${gradients.join(", ")}; background-size: 200% 200%; }`,
    };
  }

  if (algo === "concentric") {
    const rings = Math.floor(3 + complexity);
    const stops: string[] = [];
    for (let i = 0; i < rings; i++) {
      const pos = (i / rings) * 100;
      const c = i % 2 === 0 ? color1 : color2;
      stops.push(`${c} ${pos}%`);
      if (i < rings - 1) stops.push(`${c} ${pos + (100 / rings) * 0.4}%`);
    }
    return {
      html: `<div class="art"></div>`,
      css: `.art { ${containerCss} background: radial-gradient(circle, ${stops.join(", ")}); }`,
    };
  }

  if (algo === "wave") {
    const freq = Math.floor(1 + complexity * 0.3);
    const stops = [];
    for (let i = 0; i <= 100; i += 5) {
      const c = i % (50 / freq) < (25 / freq) ? color1 : color2;
      stops.push(`${c} ${i}% ${i}%`);
    }
    return {
      html: `<div class="art"></div>`,
      css: `.art { ${containerCss} background: linear-gradient(90deg, ${color1} 0%, ${color2} 50%, ${color1} 100%); }`,
    };
  }

  return { html: `<div class="art"></div>`, css: `.art { ${containerCss} background: ${color1}; }` };
}

function buildSrcdoc(html: string, css: string) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f8f9fa;}${css}</style></head><body>${html}</body></html>`;
}

export default function CssArt() {
  const [algo, setAlgo] = useState<Algorithm>("dots");
  const [color1, setColor1] = useState("#667eea");
  const [color2, setColor2] = useState("#764ba2");
  const [size, setSize] = useState(300);
  const [complexity, setComplexity] = useState(5);
  const [html, setHtml] = useState("");
  const [css, setCss] = useState("");

  const generated = useMemo(() => generateCss(algo, color1, color2, size, complexity), [algo, color1, color2, size, complexity]);

  useEffect(() => {
    setHtml(generated.html);
    setCss(generated.css);
  }, [generated]);

  const copy = useCallback(() => {
    const full = `<style>\n${css}\n</style>\n${html}`;
    navigator.clipboard.writeText(full).then(
      () => toast.success("Copied to clipboard!"),
      () => toast.error("Copy failed"),
    );
  }, [css, html]);

  const downloadData = `<!DOCTYPE html>\n<html>\n<head>\n<meta charset="utf-8">\n<style>\nbody { display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }\n${css}\n</style>\n</head>\n<body>\n${html}\n</body>\n</html>`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <Label className="text-xs mb-1 block">Algorithm</Label>
          <Select value={algo} onValueChange={(v) => v && setAlgo(v as Algorithm)}>
            <SelectTrigger className="w-40"><span>{ALGO_LABELS[algo]}</span></SelectTrigger>
            <SelectContent>
              {(Object.keys(ALGO_LABELS) as Algorithm[]).map((a) => (
                <SelectItem key={a} value={a}>{ALGO_LABELS[a]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs mb-1 block">Size: {size}px</Label>
          <div className="w-40">
            <Slider value={[size]} onValueChange={(v) => setSize(Array.isArray(v) ? v[0] : v)} min={150} max={600} step={10} />
          </div>
        </div>
        <div>
          <Label className="text-xs mb-1 block">Complexity: {complexity}</Label>
          <div className="w-40">
            <Slider value={[complexity]} onValueChange={(v) => setComplexity(Array.isArray(v) ? v[0] : v)} min={1} max={10} step={1} />
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={copy}>Copy CSS</Button>
        <DownloadButton data={downloadData} filename="css-art.html" mimeType="text/html" label="Download" />
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex items-end gap-2">
          <div>
            <Label className="text-xs mb-1 block">Color 1</Label>
            <input
              type="color"
              value={color1}
              onChange={(e) => setColor1(e.target.value)}
              className="h-9 w-12 rounded border border-border cursor-pointer"
            />
          </div>
          <div>
            <Label className="text-xs mb-1 block">Color 2</Label>
            <input
              type="color"
              value={color2}
              onChange={(e) => setColor2(e.target.value)}
              className="h-9 w-12 rounded border border-border cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs mb-1 block">Preview</Label>
          <iframe
            srcDoc={buildSrcdoc(html, css)}
            sandbox="allow-scripts"
            className="w-full rounded-md border border-border bg-white"
            style={{ height: "360px" }}
            title="CSS Art Preview"
          />
        </div>

        <div className="space-y-2">
          <div>
            <Label className="text-xs mb-1 block font-mono">HTML</Label>
            <textarea
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              className="w-full h-20 rounded-md border border-border bg-muted/50 p-3 font-mono text-xs resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
              spellCheck={false}
            />
          </div>
          <div>
            <Label className="text-xs mb-1 block font-mono">CSS</Label>
            <textarea
              value={css}
              onChange={(e) => setCss(e.target.value)}
              className="w-full h-56 rounded-md border border-border bg-muted/50 p-3 font-mono text-xs resize-y focus:outline-none focus:ring-2 focus:ring-primary/40"
              spellCheck={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
