"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { FileDropZone } from "@/components/ui/file-drop-zone";

interface Sound {
  id: string;
  name: string;
  url: string;
}

function makeid() {
  return Math.random().toString(36).slice(2, 9);
}

export default function Soundboard() {
  const t = useTranslations("soundboard");
  const [sounds, setSounds] = useState<Sound[]>([]);
  const [volume, setVolume] = useState(80);
  const [playing, setPlaying] = useState<string | null>(null);
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});
  // Keep a stable ref so the unmount cleanup can revoke all URLs without
  // needing sounds in the dependency array (which would cause double-revokes)
  const soundsRef = useRef<Sound[]>([]);
  // Sync ref inside an effect — ref writes must not happen during render (React 19)
  useEffect(() => { soundsRef.current = sounds; }, [sounds]);

  // Revoke all blob URLs on unmount
  useEffect(() => {
    return () => { soundsRef.current.forEach((s) => URL.revokeObjectURL(s.url)); };
  }, []);

  const handleFiles = useCallback((files: File[]) => {
    const newSounds: Sound[] = files.map((f) => ({
      id: makeid(),
      name: f.name.replace(/\.[^.]+$/, ""),
      url: URL.createObjectURL(f),
    }));
    setSounds((prev) => [...prev, ...newSounds]);
  }, []);

  const play = useCallback((sound: Sound) => {
    const audio = audioRefs.current[sound.id];
    if (!audio) return;
    audio.volume = volume / 100;
    audio.currentTime = 0;
    audio.play();
    setPlaying(sound.id);
    audio.onended = () => setPlaying((p) => (p === sound.id ? null : p));
  }, [volume]);

  const stopAll = useCallback(() => {
    Object.values(audioRefs.current).forEach((a) => {
      a.pause();
      a.currentTime = 0;
    });
    setPlaying(null);
  }, []);

  const remove = useCallback((id: string) => {
    const audio = audioRefs.current[id];
    if (audio) {
      audio.pause();
      delete audioRefs.current[id];
    }
    setSounds((prev) => {
      const s = prev.find((x) => x.id === id);
      if (s) URL.revokeObjectURL(s.url);
      return prev.filter((x) => x.id !== id);
    });
    setPlaying((p) => (p === id ? null : p));
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-40 max-w-60">
          <Label className="text-xs mb-1 block">{t("volumeLabel", { value: volume })}</Label>
          <Slider
            value={[volume]}
            onValueChange={(v) => setVolume(Array.isArray(v) ? v[0] : v)}
            min={0}
            max={100}
            step={1}
          />
        </div>
        {sounds.length > 0 && (
          <Button size="sm" variant="outline" onClick={stopAll}>{t("stopAll")}</Button>
        )}
      </div>

      <FileDropZone
        accept="audio/*"
        multiple
        onFiles={handleFiles}
        label={t("dropLabel")}
        maxSizeMB={50}
      />

      {sounds.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {sounds.map((sound) => (
            <div key={sound.id} className="relative group">
              <audio
                ref={(el) => { if (el) audioRefs.current[sound.id] = el; }}
                src={sound.url}
                preload="auto"
              />
              <button
                onClick={() => play(sound)}
                className={`w-full rounded-lg border-2 p-3 text-left text-sm font-medium transition-colors ${
                  playing === sound.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-muted/50 hover:bg-muted hover:border-muted-foreground/40"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{playing === sound.id ? "🔊" : "▶️"}</span>
                  <span className="truncate">{sound.name}</span>
                </div>
              </button>
              <button
                onClick={() => remove(sound.id)}
                className="absolute top-1 right-1 hidden group-hover:flex h-5 w-5 items-center justify-center rounded-full bg-destructive/90 text-destructive-foreground text-xs"
                aria-label={t("removeAriaLabel", { name: sound.name })}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {sounds.length === 0 && (
        <p className="text-xs text-muted-foreground text-center">
          {t("emptyHint")}
        </p>
      )}
    </div>
  );
}
