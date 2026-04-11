"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

export default function RoiCalculator() {
  const [initial, setInitial] = useState(10000);
  const [final, setFinal] = useState(15000);
  const [years, setYears] = useState(3);

  const result = useMemo(() => {
    const gain = final - initial;
    const roi = initial !== 0 ? (gain / initial) * 100 : 0;
    const annualized = initial > 0 && years > 0 ? (Math.pow(final / initial, 1 / years) - 1) * 100 : 0;
    return { gain, roi, annualized };
  }, [initial, final, years]);

  const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div><Label className="text-sm mb-1 block">Initial Investment</Label><Input type="number" value={initial} onChange={(e) => setInitial(Number(e.target.value))} /></div>
        <div><Label className="text-sm mb-1 block">Final Value</Label><Input type="number" value={final} onChange={(e) => setFinal(Number(e.target.value))} /></div>
        <div><Label className="text-sm mb-1 block">Years</Label><Input type="number" min={1} value={years} onChange={(e) => setYears(Number(e.target.value))} /></div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card className="p-4 text-center"><div className="text-2xl font-bold tabular-nums">{fmt(result.gain)}</div><div className="text-xs text-muted-foreground">Net Gain/Loss</div></Card>
        <Card className="p-4 text-center"><div className="text-2xl font-bold tabular-nums">{result.roi.toFixed(2)}%</div><div className="text-xs text-muted-foreground">Total ROI</div></Card>
        <Card className="p-4 text-center"><div className="text-2xl font-bold tabular-nums">{result.annualized.toFixed(2)}%</div><div className="text-xs text-muted-foreground">Annualized ROI</div></Card>
      </div>
    </div>
  );
}
