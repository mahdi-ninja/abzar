"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

// Each make function returns the output node (what feeds the gain) AND all
// source nodes that need to be explicitly stopped when the sound is toggled off.
type MakeResult = { output: AudioNode; sources: AudioScheduledSourceNode[] };

function makeNoiseBuffer(ctx: AudioContext, type: "white" | "pink" | "brown"): AudioBufferSourceNode {
  const len = ctx.sampleRate * 2;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  if (type === "white") {
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  } else if (type === "pink") {
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759;
      b2 = 0.96900 * b2 + w * 0.1538520; b3 = 0.86650 * b3 + w * 0.3104856;
      b4 = 0.55000 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.0168980;
      d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + w * 0.5362) * 0.11;
    }
  } else {
    let last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      last = (last + 0.02 * w) / 1.02;
      d[i] = last * 3.5;
    }
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  src.start();
  return src;
}

function makeWhiteNoise(ctx: AudioContext): MakeResult {
  const src = makeNoiseBuffer(ctx, "white");
  return { output: src, sources: [src] };
}

function makePinkNoise(ctx: AudioContext): MakeResult {
  const src = makeNoiseBuffer(ctx, "pink");
  return { output: src, sources: [src] };
}

function makeBrownNoise(ctx: AudioContext): MakeResult {
  const src = makeNoiseBuffer(ctx, "brown");
  return { output: src, sources: [src] };
}

function makeRain(ctx: AudioContext): MakeResult {
  const src = makeNoiseBuffer(ctx, "white");
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 3000;
  filter.Q.value = 0.3;
  src.connect(filter);
  return { output: filter, sources: [src] };
}

function makeOcean(ctx: AudioContext): MakeResult {
  const src = makeNoiseBuffer(ctx, "pink");
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 400;
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.1;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 200;
  lfo.connect(lfoGain);
  lfoGain.connect(filter.frequency);
  lfo.start();
  src.connect(filter);
  return { output: filter, sources: [src, lfo] };
}

interface SoundDef {
  id: string;
  labelKey: string;
  emoji: string;
  make: (ctx: AudioContext) => MakeResult;
}

const SOUNDS: SoundDef[] = [
  { id: "white", labelKey: "whiteNoise", emoji: "〰️", make: makeWhiteNoise },
  { id: "pink", labelKey: "pinkNoise", emoji: "🎧", make: makePinkNoise },
  { id: "brown", labelKey: "brownNoise", emoji: "🌫️", make: makeBrownNoise },
  { id: "rain", labelKey: "rain", emoji: "🌧️", make: makeRain },
  { id: "ocean", labelKey: "ocean", emoji: "🌊", make: makeOcean },
];

interface ActiveNode {
  sources: AudioScheduledSourceNode[];
  gain: GainNode;
}

export default function AmbientSounds() {
  const t = useTranslations("ambientSounds");
  const [active, setActive] = useState<Set<string>>(new Set());
  const [volumes, setVolumes] = useState<Record<string, number>>(() =>
    Object.fromEntries(SOUNDS.map((s) => [s.id, 50]))
  );
  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<Record<string, ActiveNode>>({});

  const getCtx = useCallback((): AudioContext => {
    if (!ctxRef.current) ctxRef.current = new AudioContext();
    if (ctxRef.current.state === "suspended") ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  useEffect(() => {
    return () => {
      Object.values(nodesRef.current).forEach(({ sources, gain }) => {
        sources.forEach((s) => { try { s.stop(); } catch {} });
        try { gain.disconnect(); } catch {}
      });
      nodesRef.current = {};
      ctxRef.current?.close();
    };
  }, []);

  // Stop a sound immediately (no fade) — used for cleanup
  const stopNow = useCallback((id: string) => {
    const node = nodesRef.current[id];
    if (!node) return;
    node.sources.forEach((s) => { try { s.stop(); } catch {} });
    try { node.gain.disconnect(); } catch {}
    delete nodesRef.current[id];
  }, []);

  // Fade out then stop — called from the toggle button
  const fadeAndStop = useCallback((id: string) => {
    const node = nodesRef.current[id];
    if (!node) return;
    const ctx = ctxRef.current;
    if (ctx && ctx.state !== "closed") {
      node.gain.gain.setTargetAtTime(0, ctx.currentTime, 0.08);
    }
    delete nodesRef.current[id]; // remove before timeout so a quick re-toggle starts fresh
    setTimeout(() => {
      node.sources.forEach((s) => { try { s.stop(); } catch {} });
      try { node.gain.disconnect(); } catch {}
    }, 300);
  }, []);

  // Audio side effects are done OUTSIDE the state updater to avoid React Strict Mode
  // double-invocation running them twice (or not at all on the second call)
  const toggle = useCallback((sound: SoundDef) => {
    if (active.has(sound.id)) {
      fadeAndStop(sound.id);
      setActive((prev) => {
        const next = new Set(prev);
        next.delete(sound.id);
        return next;
      });
    } else {
      const ctx = getCtx();
      const { output, sources } = sound.make(ctx);
      const gain = ctx.createGain();
      gain.gain.value = (volumes[sound.id] ?? 50) / 100 * 0.6;
      output.connect(gain);
      gain.connect(ctx.destination);
      nodesRef.current[sound.id] = { sources, gain };
      setActive((prev) => {
        const next = new Set(prev);
        next.add(sound.id);
        return next;
      });
    }
  }, [active, getCtx, volumes, fadeAndStop]);

  const setVolume = useCallback((id: string, v: number) => {
    setVolumes((prev) => ({ ...prev, [id]: v }));
    const node = nodesRef.current[id];
    const ctx = ctxRef.current;
    if (node && ctx && ctx.state !== "closed") {
      node.gain.gain.setTargetAtTime(v / 100 * 0.6, ctx.currentTime, 0.05);
    }
  }, []);

  const stopAll = useCallback(() => {
    active.forEach((id) => fadeAndStop(id));
    setActive(new Set());
  }, [active, fadeAndStop]);

  // Also stop all nodes immediately when explicitly called (for the unmount stopNow ref)
  void stopNow;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <p className="text-sm text-muted-foreground">{t("description")}</p>
        {active.size > 0 && (
          <Button size="sm" variant="outline" onClick={stopAll}>{t("stopAll")}</Button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SOUNDS.map((sound) => {
          const on = active.has(sound.id);
          return (
            <div key={sound.id} className={`rounded-lg border-2 p-4 transition-colors ${on ? "border-primary bg-primary/5" : "border-border bg-muted/30"}`}>
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => toggle(sound)}
                  className="flex items-center gap-2 font-medium text-sm"
                >
                  <span className="text-xl">{sound.emoji}</span>
                  <span>{t(sound.labelKey as "whiteNoise" | "pinkNoise" | "brownNoise" | "rain" | "ocean")}</span>
                  {on && <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />}
                </button>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">
                  {t("volumeLabel", { value: volumes[sound.id] })}
                </Label>
                <Slider
                  value={[volumes[sound.id]]}
                  onValueChange={(v) => setVolume(sound.id, Array.isArray(v) ? v[0] : v)}
                  min={0}
                  max={100}
                  step={1}
                  disabled={!on}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
