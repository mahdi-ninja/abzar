"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

type Phase = "work" | "short-break" | "long-break";

const PHASE_LABELS: Record<Phase, string> = {
  work: "Focus",
  "short-break": "Short Break",
  "long-break": "Long Break",
};

export default function Pomodoro() {
  const [workMin, setWorkMin] = useState(25);
  const [shortBreakMin, setShortBreakMin] = useState(5);
  const [longBreakMin, setLongBreakMin] = useState(15);
  const [sessionsBeforeLong, setSessionsBeforeLong] = useState(4);

  const [phase, setPhase] = useState<Phase>("work");
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getDuration = useCallback(
    (p: Phase) => {
      if (p === "work") return workMin * 60;
      if (p === "short-break") return shortBreakMin * 60;
      return longBreakMin * 60;
    },
    [workMin, shortBreakMin, longBreakMin]
  );

  const startNextPhase = useCallback(
    (currentPhase: Phase, sessions: number) => {
      let next: Phase;
      let newSessions = sessions;
      if (currentPhase === "work") {
        newSessions = sessions + 1;
        next = newSessions % sessionsBeforeLong === 0 ? "long-break" : "short-break";
      } else {
        next = "work";
      }
      setPhase(next);
      setSecondsLeft(getDuration(next));
      setCompletedSessions(newSessions);
      setRunning(false);

      // Play notification sound
      try {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 800;
        gain.gain.value = 0.3;
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } catch {
        // ignore audio errors
      }
    },
    [getDuration, sessionsBeforeLong]
  );

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            startNextPhase(phase, completedSessions);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, phase, completedSessions, startNextPhase]);

  const handleStartPause = useCallback(() => {
    setRunning((prev) => !prev);
  }, []);

  const handleReset = useCallback(() => {
    setRunning(false);
    setPhase("work");
    setSecondsLeft(workMin * 60);
    setCompletedSessions(0);
  }, [workMin]);

  const handleSkip = useCallback(() => {
    setRunning(false);
    startNextPhase(phase, completedSessions);
  }, [phase, completedSessions, startNextPhase]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const totalDuration = getDuration(phase);
  const progress = totalDuration > 0 ? ((totalDuration - secondsLeft) / totalDuration) * 100 : 0;

  const phaseColor =
    phase === "work"
      ? "text-primary"
      : phase === "short-break"
      ? "text-emerald-500"
      : "text-blue-500";

  return (
    <div className="space-y-6">
      {/* Timer display */}
      <div className="flex flex-col items-center gap-4">
        <div className={`text-sm font-medium ${phaseColor}`}>
          {PHASE_LABELS[phase]}
        </div>

        {/* Circular progress */}
        <div className="relative h-56 w-56">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50" cy="50" r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-muted"
            />
            <circle
              cx="50" cy="50" r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              strokeLinecap="round"
              className={phaseColor}
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-bold tabular-nums">
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <Button onClick={handleStartPause} className="w-24">
            {running ? "Pause" : "Start"}
          </Button>
          <Button variant="outline" onClick={handleSkip}>
            Skip
          </Button>
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          Sessions completed: {completedSessions}
        </div>
      </div>

      {/* Settings */}
      <Card className="p-4">
        <Label className="text-sm font-medium mb-3 block">Settings</Label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <Label className="text-xs mb-1 block">Work (min)</Label>
            <Input
              type="number"
              min={1}
              max={120}
              value={workMin}
              onChange={(e) => {
                const v = Number(e.target.value);
                setWorkMin(v);
                if (phase === "work" && !running) setSecondsLeft(v * 60);
              }}
              className="text-sm"
            />
          </div>
          <div>
            <Label className="text-xs mb-1 block">Short Break</Label>
            <Input
              type="number"
              min={1}
              max={30}
              value={shortBreakMin}
              onChange={(e) => setShortBreakMin(Number(e.target.value))}
              className="text-sm"
            />
          </div>
          <div>
            <Label className="text-xs mb-1 block">Long Break</Label>
            <Input
              type="number"
              min={1}
              max={60}
              value={longBreakMin}
              onChange={(e) => setLongBreakMin(Number(e.target.value))}
              className="text-sm"
            />
          </div>
          <div>
            <Label className="text-xs mb-1 block">Long Break After</Label>
            <Input
              type="number"
              min={1}
              max={10}
              value={sessionsBeforeLong}
              onChange={(e) => setSessionsBeforeLong(Number(e.target.value))}
              className="text-sm"
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
