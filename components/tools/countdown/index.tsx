"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

export default function Countdown() {
  const [target, setTarget] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  });
  const [title, setTitle] = useState("My Event");
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const targetMs = new Date(target + "T00:00:00").getTime();
  const diff = Math.max(0, targetMs - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  const isPast = targetMs <= now;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[200px]"><Label className="text-sm mb-1 block">Event Name</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
        <div><Label className="text-sm mb-1 block">Target Date</Label><Input type="date" value={target} onChange={(e) => setTarget(e.target.value)} /></div>
      </div>
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground mb-2">{title}</p>
        {isPast ? (
          <p className="text-2xl font-bold text-primary">Event has passed!</p>
        ) : (
          <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
            {[
              { value: days, label: "Days" },
              { value: hours, label: "Hours" },
              { value: minutes, label: "Minutes" },
              { value: seconds, label: "Seconds" },
            ].map(({ value, label }) => (
              <Card key={label} className="p-3 text-center">
                <div className="text-3xl font-bold tabular-nums">{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
