"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

function addMinutes(time: string, mins: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + mins;
  const nh = ((total % 1440) + 1440) % 1440;
  return `${String(Math.floor(nh / 60)).padStart(2, "0")}:${String(nh % 60).padStart(2, "0")}`;
}

function formatTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

export default function SleepCalculator() {
  const [mode, setMode] = useState<"wake" | "sleep">("wake");
  const [time, setTime] = useState("07:00");
  const CYCLE = 90;
  const FALL_ASLEEP = 15;

  const suggestions = useMemo(() => {
    const results = [];
    for (let cycles = 6; cycles >= 3; cycles--) {
      const sleepDuration = cycles * CYCLE;
      if (mode === "wake") {
        const bedtime = addMinutes(time, -(sleepDuration + FALL_ASLEEP));
        results.push({ cycles, time: bedtime, hours: sleepDuration / 60 });
      } else {
        const wakeTime = addMinutes(time, sleepDuration + FALL_ASLEEP);
        results.push({ cycles, time: wakeTime, hours: sleepDuration / 60 });
      }
    }
    return results;
  }, [time, mode]);

  return (
    <div className="space-y-6">
      <Tabs value={mode} onValueChange={(v) => setMode(v as "wake" | "sleep")}>
        <TabsList className="h-8">
          <TabsTrigger value="wake" className="text-xs px-3 h-6">I want to wake up at...</TabsTrigger>
          <TabsTrigger value="sleep" className="text-xs px-3 h-6">I want to go to sleep at...</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="flex items-end gap-3">
        <div><Label className="text-sm mb-1 block">{mode === "wake" ? "Wake up time" : "Bedtime"}</Label><Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-40" /></div>
        <Button size="sm" variant="outline" onClick={() => { setMode("wake"); setTime("07:00"); }}>Reset</Button>
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-medium">{mode === "wake" ? "Go to bed at:" : "Set your alarm for:"}</Label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {suggestions.map((s) => (
            <Card key={s.cycles} className={`p-4 text-center ${s.cycles >= 5 ? "border-primary" : ""}`}>
              <div className="text-xl font-bold">{formatTime(s.time)}</div>
              <div className="text-xs text-muted-foreground">{s.cycles} cycles · {s.hours}h</div>
              {s.cycles >= 5 && <div className="text-[10px] text-primary font-medium mt-1">Recommended</div>}
            </Card>
          ))}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">Based on 90-minute sleep cycles + 15 minutes to fall asleep.</p>
    </div>
  );
}
