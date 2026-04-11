"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

export default function BmiCalculator() {
  const [imperial, setImperial] = useState(false);
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(175);

  const bmi = useMemo(() => {
    const w = imperial ? weight * 0.453592 : weight;
    const h = imperial ? height * 0.0254 : height / 100;
    if (h <= 0) return 0;
    return w / (h * h);
  }, [weight, height, imperial]);

  const category = bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obese";
  const categoryColor = bmi < 18.5 ? "text-blue-500" : bmi < 25 ? "text-emerald-500" : bmi < 30 ? "text-amber-500" : "text-destructive";
  const pct = Math.min(100, Math.max(0, ((bmi - 10) / 35) * 100));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-1.5">
        <Switch checked={imperial} onCheckedChange={setImperial} />
        <Label className="text-xs">{imperial ? "Imperial (lbs/in)" : "Metric (kg/cm)"}</Label>
      </div>
      <div className="flex flex-wrap items-end gap-4">
        <div><Label className="text-sm mb-1 block">Weight ({imperial ? "lbs" : "kg"})</Label><Input type="number" min={1} value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="w-28" /></div>
        <div><Label className="text-sm mb-1 block">Height ({imperial ? "inches" : "cm"})</Label><Input type="number" min={1} value={height} onChange={(e) => setHeight(Number(e.target.value))} className="w-28" /></div>
      </div>
      <Card className="p-6 text-center">
        <div className="text-4xl font-bold tabular-nums">{bmi.toFixed(1)}</div>
        <div className={`text-sm font-medium mt-1 ${categoryColor}`}>{category}</div>
        <div className="mt-3 h-3 w-full rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: `linear-gradient(to right, #3b82f6, #10b981, #f59e0b, #ef4444)` }} />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1"><span>Underweight</span><span>Normal</span><span>Overweight</span><span>Obese</span></div>
      </Card>
    </div>
  );
}
