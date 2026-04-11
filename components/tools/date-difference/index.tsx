"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DateDifference() {
  const [from, setFrom] = useState(new Date().toISOString().split("T")[0]);
  const [to, setTo] = useState(() => { const d = new Date(); d.setFullYear(d.getFullYear() + 1); return d.toISOString().split("T")[0]; });

  const diff = useMemo(() => {
    const a = new Date(from + "T00:00:00"), b = new Date(to + "T00:00:00");
    if (isNaN(a.getTime()) || isNaN(b.getTime())) return null;
    const ms = Math.abs(b.getTime() - a.getTime());
    const days = Math.floor(ms / 86400000);
    const weeks = Math.floor(days / 7);
    const months = Math.abs((b.getFullYear() - a.getFullYear()) * 12 + b.getMonth() - a.getMonth());
    const years = Math.abs(b.getFullYear() - a.getFullYear());
    const hours = days * 24;
    const minutes = hours * 60;
    return { days, weeks, months, years, hours, minutes };
  }, [from, to]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <div><Label className="text-sm mb-1 block">From</Label><Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
        <div><Label className="text-sm mb-1 block">To</Label><Input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></div>
        <Button size="sm" variant="outline" onClick={() => { setFrom(new Date().toISOString().split("T")[0]); const d = new Date(); d.setFullYear(d.getFullYear() + 1); setTo(d.toISOString().split("T")[0]); }}>Reset</Button>
      </div>
      {diff && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            { label: "Days", value: diff.days.toLocaleString() },
            { label: "Weeks", value: diff.weeks.toLocaleString() },
            { label: "Months", value: diff.months.toLocaleString() },
            { label: "Years", value: diff.years.toLocaleString() },
            { label: "Hours", value: diff.hours.toLocaleString() },
            { label: "Minutes", value: diff.minutes.toLocaleString() },
          ].map(({ label, value }) => (
            <Card key={label} className="p-3 text-center">
              <div className="text-2xl font-bold tabular-nums">{value}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
