"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { renderOffline, encodeWav, type Instrument } from "./utils";

const INSTRUMENTS: Instrument[] = [
  { name: "Kick", freq: 60, decay: 0.3, type: "sine" },
  { name: "Snare", freq: 200, decay: 0.15, type: "triangle" },
  { name: "Hi-Hat", freq: 800, decay: 0.05, type: "square" },
  { name: "Tom", freq: 120, decay: 0.2, type: "sine" },
  { name: "Clap", freq: 400, decay: 0.1, type: "sawtooth" },
  { name: "Rim", freq: 600, decay: 0.05, type: "triangle" },
];

const STEPS = 16;

function playSound(ctx: AudioContext, instrument: Instrument) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = instrument.type;
  osc.frequency.value = instrument.freq;
  gain.gain.setValueAtTime(0.5, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + instrument.decay);
  osc.start();
  osc.stop(ctx.currentTime + instrument.decay + 0.05);
}

export default function DrumMachine() {
  const t = useTranslations("drumMachine");
  const [grid, setGrid] = useState<boolean[][]>(() =>
    INSTRUMENTS.map(() => Array(STEPS).fill(false))
  );
  const [bpm, setBpm] = useState(120);
  const [playing, setPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [bars, setBars] = useState<number>(2);
  const [isExporting, setIsExporting] = useState(false);

  // Use refs so the interval callback always reads latest values
  const gridRef = useRef(grid);
  const bpmRef = useRef(bpm);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stepRef = useRef(0);
  const playingRef = useRef(false);
  const tickRef = useRef<() => void>(() => {});

  useEffect(() => { gridRef.current = grid; }, [grid]);
  useEffect(() => { bpmRef.current = bpm; }, [bpm]);

  const toggleCell = useCallback((row: number, step: number) => {
    setGrid((prev) => {
      const next = prev.map((r) => [...r]);
      next[row][step] = !next[row][step];
      return next;
    });
  }, []);

  const tick = useCallback(() => {
    if (!playingRef.current || !audioCtxRef.current) return;

    const ctx = audioCtxRef.current;
    const step = stepRef.current;
    const currentGrid = gridRef.current;

    setCurrentStep(step);

    for (let row = 0; row < INSTRUMENTS.length; row++) {
      if (currentGrid[row][step]) {
        playSound(ctx, INSTRUMENTS[row]);
      }
    }

    stepRef.current = (step + 1) % STEPS;
    const interval = (60 / bpmRef.current / 4) * 1000;
    timerRef.current = setTimeout(tickRef.current, interval);
  }, []);
  useEffect(() => { tickRef.current = tick; }, [tick]);

  const handlePlay = useCallback(async () => {
    if (playing || playingRef.current) {
      playingRef.current = false;
      setPlaying(false);
      setCurrentStep(-1);
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    // Create or resume audio context (must happen in user gesture handler)
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === "suspended") {
      await audioCtxRef.current.resume();
    }

    stepRef.current = 0;
    playingRef.current = true;
    setPlaying(true);
    tickRef.current();
  }, [playing]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      playingRef.current = false;
      audioCtxRef.current?.close();
      audioCtxRef.current = null;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const clearState = useCallback(() => {
    setBpm(120);
    setGrid(INSTRUMENTS.map(() => Array(STEPS).fill(false)));
  }, []);

  const handleDownload = useCallback(async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const audioBuffer = await renderOffline(grid, INSTRUMENTS, bpm, bars);
      const blob = encodeWav(audioBuffer);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `beat-${bars}bar-${bpm}bpm.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  }, [isExporting, grid, bpm, bars]);

  const isEmpty = grid.every((r) => r.every((c) => !c));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <Button onClick={handlePlay} className="w-20">
          {playing ? t("stop") : t("play")}
        </Button>
        <div className="flex-1 min-w-37.5 max-w-50">
          <Label className="text-xs mb-1 block">{t("bpm", { bpm })}</Label>
          <Slider
            value={[bpm]}
            onValueChange={(v) => setBpm(Array.isArray(v) ? v[0] : v)}
            min={60}
            max={200}
            step={1}
          />
        </div>
        <Button size="sm" variant="outline" onClick={clearState}>
          {t("clear")}
        </Button>
      </div>

      {/* Sequencer grid */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-max">
          {INSTRUMENTS.map((inst, row) => (
            <div key={inst.name} className="flex items-center gap-1 mb-1">
              <div className="w-16 text-xs font-medium text-right pr-2 shrink-0">
                {inst.name}
              </div>
              {Array.from({ length: STEPS }, (_, step) => (
                <button
                  key={step}
                  onClick={() => toggleCell(row, step)}
                  aria-label={t("toggleStep", { instrument: inst.name, step: step + 1 })}
                  className={`h-8 w-8 rounded-sm border transition-colors ${
                    grid[row][step]
                      ? "bg-primary border-primary"
                      : step % 4 === 0
                      ? "bg-muted/80 border-border hover:bg-muted"
                      : "bg-muted/30 border-border/50 hover:bg-muted/60"
                  } ${currentStep === step && playing ? "ring-2 ring-primary/50" : ""}`}
                />
              ))}
            </div>
          ))}

          <div className="flex items-center gap-1 mt-1">
            <div className="w-16 shrink-0" />
            {Array.from({ length: STEPS }, (_, step) => (
              <div
                key={step}
                className={`h-1.5 w-8 rounded-full transition-colors ${
                  currentStep === step && playing ? "bg-primary" : "bg-transparent"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Label className="text-xs whitespace-nowrap">{t("exportBars")}</Label>
        {([1, 2, 4, 8] as const).map((n) => (
          <Button
            key={n}
            size="sm"
            variant={bars === n ? "default" : "outline"}
            className="h-7 w-7 p-0 text-xs"
            onClick={() => setBars(n)}
          >
            {n}
          </Button>
        ))}
        <Input
          type="number"
          min={1}
          max={64}
          step={1}
          value={bars}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            if (!isNaN(v)) setBars(Math.min(64, Math.max(1, v)));
          }}
          onBlur={(e) => {
            if (e.target.value === "" || isNaN(parseInt(e.target.value, 10))) {
              setBars(bars);
            }
          }}
          className="h-7 w-16 text-xs text-center"
        />
        <Button
          size="sm"
          variant="outline"
          onClick={handleDownload}
          disabled={isExporting || isEmpty}
        >
          {isExporting ? t("rendering") : t("downloadWav")}
        </Button>
      </div>
    </div>
  );
}
