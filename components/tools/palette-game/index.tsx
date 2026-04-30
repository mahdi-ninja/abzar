"use client";
import { useState, useRef, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

type Difficulty = "3" | "5" | "8";
const DIFF_KEYS: Record<Difficulty, string> = { "3": "diffEasy", "5": "diffMedium", "8": "diffHard" };

function hsvToHex(h: number, s: number, v: number): string {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    const val = v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
    return Math.round(val * 255).toString(16).padStart(2, "0");
  };
  return `#${f(5)}${f(3)}${f(1)}`;
}

// Relative luminance per WCAG 2.x — used for brightness-based sorting
function hexLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function genPalette(count: number, seed: number): string[] {
  let s = seed >>> 0;
  const rand = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 0xffffffff; };
  const baseHue = rand() * 360;
  const sat = 0.6 + rand() * 0.4;
  const palette = Array.from({ length: count }, (_, i) => {
    const hue = (baseHue + (i / count) * 360) % 360;
    const val = 0.4 + (i / (count - 1 || 1)) * 0.5;
    return hsvToHex(hue, sat, val);
  });
  // Sort by perceptual luminance (dark → bright) so the "correct" order
  // is visually verifiable by the player
  return palette.sort((a, b) => hexLuminance(a) - hexLuminance(b));
}

function shuffle<T>(arr: T[], seed: number): T[] {
  let s = (seed * 31337) >>> 0;
  const rand = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 0xffffffff; };
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function scoreArr(answer: string[], correct: string[]): number {
  let right = 0;
  answer.forEach((c, i) => { if (c === correct[i]) right++; });
  return Math.round((right / correct.length) * 100);
}

export default function PaletteGame() {
  const t = useTranslations("paletteGame");
  const [bestScores, setBestScores] = useState<Record<Difficulty, number>>(() => {
    if (typeof window === "undefined") {
      return { "3": 0, "5": 0, "8": 0 };
    }

    try {
      const stored = localStorage.getItem("abzar:palette-game:best");
      return stored ? JSON.parse(stored) : { "3": 0, "5": 0, "8": 0 };
    } catch {
      return { "3": 0, "5": 0, "8": 0 };
    }
  });
  const [difficulty, setDifficulty] = useState<Difficulty>("5");
  const [seed, setSeed] = useState(1);
  const [tiles, setTiles] = useState<string[]>([]);
  const [correct, setCorrect] = useState<string[]>([]);
  const [dragging, setDragging] = useState<number | null>(null);
  // Ref for drag index so handleDrop always reads the latest value regardless
  // of whether React has committed the setDragging update yet
  const draggingRef = useRef<number | null>(null);
  const [result, setResult] = useState<number | null>(null);
  const [started, setStarted] = useState(false);
  
  const startGame = useCallback(() => {
    const count = parseInt(difficulty);
    const palette = genPalette(count, seed);
    setCorrect(palette);
    setTiles(shuffle(palette, seed + 7));
    setResult(null);
    setStarted(true);
  }, [difficulty, seed]);

  const newGame = useCallback(() => {
    setSeed((s) => s + 1);
    setStarted(false);
    setResult(null);
  }, []);

  const handleDragStart = useCallback((i: number) => {
    draggingRef.current = i;
    setDragging(i);
  }, []);

  const handleDrop = useCallback((i: number) => {
    const d = draggingRef.current;
    if (d === null || d === i) return;
    setTiles((prev) => {
      const next = [...prev];
      [next[d], next[i]] = [next[i], next[d]];
      return next;
    });
    draggingRef.current = null;
    setDragging(null);
  }, []);

  const submit = useCallback(() => {
    const s = scoreArr(tiles, correct);
    setResult(s);
    if (s > (bestScores[difficulty] ?? 0)) {
      const next = { ...bestScores, [difficulty]: s };
      setBestScores(next);
      try { localStorage.setItem("abzar:palette-game:best", JSON.stringify(next)); } catch {}
    }
  }, [tiles, correct, bestScores, difficulty]);

  const gradeLabel = useMemo(() => {
    if (result === null) return "";
    if (result === 100) return t("perfect");
    if (result >= 80) return t("great");
    if (result >= 60) return t("good");
    if (result >= 40) return t("keepTrying");
    return t("tryAgain");
  }, [result, t]);

  if (!started) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <Label className="text-xs mb-1 block">{t("difficulty")}</Label>
            <Select value={difficulty} onValueChange={(v) => v && setDifficulty(v as Difficulty)}>
              <SelectTrigger className="w-40"><span>{t(DIFF_KEYS[difficulty] as "diffEasy" | "diffMedium" | "diffHard")}</span></SelectTrigger>
              <SelectContent>
                {(Object.keys(DIFF_KEYS) as Difficulty[]).map((d) => (
                  <SelectItem key={d} value={d}>{t(DIFF_KEYS[d] as "diffEasy" | "diffMedium" | "diffHard")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={startGame}>{t("startGame")}</Button>
        </div>
        <div className="rounded-lg border border-border bg-muted/30 p-6 max-w-md">
          <h3 className="font-semibold mb-2">{t("howToPlay")}</h3>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>{t("rule1")}</li>
            <li>{t("rule2")}</li>
            <li>{t("rule3")}</li>
            <li>{t("rule4")}</li>
          </ul>
          {(Object.keys(bestScores) as Difficulty[]).some((d) => bestScores[d] > 0) && (
            <div className="mt-4 text-xs text-muted-foreground">
              {t("bestScores", { scores: (Object.entries(bestScores) as [Difficulty, number][]).map(([d, s]) => `${t(DIFF_KEYS[d] as "diffEasy" | "diffMedium" | "diffHard")}: ${s}%`).join(" · ") })}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <p className="text-xs text-muted-foreground mb-2 font-medium">{t("targetOrder")}</p>
        <div className="flex gap-2">
          {correct.map((c, i) => (
            <div key={i} className="flex-1 h-14 rounded-md border border-border shadow-sm" style={{ backgroundColor: c }} title={c} />
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-2 font-medium">{t("yourOrder")}</p>
        <div className="flex gap-2">
          {tiles.map((c, i) => (
            <div
              key={`${c}-${i}`}
              className={`flex-1 h-14 rounded-md border-2 shadow-sm cursor-grab active:cursor-grabbing transition-all ${
                dragging === i ? "scale-105 border-primary" :
                result !== null && c === correct[i] ? "border-green-500" :
                result !== null ? "border-red-400" :
                "border-border hover:border-muted-foreground"
              }`}
              style={{ backgroundColor: c }}
              title={c}
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(i)}
            />
          ))}
        </div>
      </div>

      {result === null ? (
        <div className="flex gap-2">
          <Button onClick={submit}>{t("submit")}</Button>
          <Button variant="outline" onClick={newGame}>{t("newGame")}</Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="text-3xl font-bold">{result}%</div>
            <div className="text-muted-foreground">{gradeLabel}</div>
          </div>
          <div className="flex gap-2">
            <Button onClick={newGame}>{t("playAgain")}</Button>
            <Button variant="outline" onClick={startGame}>{t("retrySame")}</Button>
          </div>
        </div>
      )}
    </div>
  );
}
