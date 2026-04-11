"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

const INSTRUMENTS = [
  { name: "Kick", freq: 60, decay: 0.3, type: "sine" as OscillatorType },
  { name: "Snare", freq: 200, decay: 0.15, type: "triangle" as OscillatorType },
  { name: "Hi-Hat", freq: 800, decay: 0.05, type: "square" as OscillatorType },
  { name: "Tom", freq: 120, decay: 0.2, type: "sine" as OscillatorType },
  { name: "Clap", freq: 400, decay: 0.1, type: "sawtooth" as OscillatorType },
  { name: "Rim", freq: 600, decay: 0.05, type: "triangle" as OscillatorType },
];

const STEPS = 16;

function playSound(ctx: AudioContext, instrument: (typeof INSTRUMENTS)[0]) {
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
  const [grid, setGrid] = useState<boolean[][]>(() =>
    INSTRUMENTS.map(() => Array(STEPS).fill(false))
  );
  const [bpm, setBpm] = useState(120);
  const [playing, setPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);

  // Use refs so the interval callback always reads latest values
  const gridRef = useRef(grid);
  const bpmRef = useRef(bpm);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stepRef = useRef(0);
  const playingRef = useRef(false);

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
    timerRef.current = setTimeout(tick, interval);
  }, []);

  const handlePlay = useCallback(async () => {
    if (playing) {
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
    tick();
  }, [playing, tick]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      playingRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const clearGrid = useCallback(() => {
    setGrid(INSTRUMENTS.map(() => Array(STEPS).fill(false)));
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <Button onClick={handlePlay} className="w-20">
          {playing ? "Stop" : "Play"}
        </Button>
        <div className="flex-1 min-w-[150px] max-w-[200px]">
          <Label className="text-xs mb-1 block">BPM: {bpm}</Label>
          <Slider
            value={[bpm]}
            onValueChange={(v) => setBpm(Array.isArray(v) ? v[0] : v)}
            min={60}
            max={200}
            step={1}
          />
        </div>
        <Button size="sm" variant="outline" onClick={clearGrid}>
          Clear
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
    </div>
  );
}
