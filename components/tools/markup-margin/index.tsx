"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function MarkupMargin() {
  const [cost, setCost] = useState(50);
  const [revenue, setRevenue] = useState(100);
  const [markupPct, setMarkupPct] = useState(100);
  const [marginPct, setMarginPct] = useState(50);
  const [lastChanged, setLastChanged] = useState<"cost" | "revenue" | "markup" | "margin">("cost");

  const { derivedRevenue, derivedMarkup, derivedMargin } = useMemo(() => {
    if (lastChanged === "cost" || lastChanged === "revenue") {
      return {
        derivedRevenue: revenue,
        derivedMarkup: cost > 0 ? Math.round(((revenue - cost) / cost) * 10000) / 100 : markupPct,
        derivedMargin: cost > 0 && revenue > 0 ? Math.round(((revenue - cost) / revenue) * 10000) / 100 : marginPct,
      };
    } else if (lastChanged === "markup") {
      const rev = cost * (1 + markupPct / 100);
      return {
        derivedRevenue: Math.round(rev * 100) / 100,
        derivedMarkup: markupPct,
        derivedMargin: rev > 0 ? Math.round(((rev - cost) / rev) * 10000) / 100 : 0,
      };
    } else {
      const rev = marginPct < 100 ? cost / (1 - marginPct / 100) : 0;
      return {
        derivedRevenue: Math.round(rev * 100) / 100,
        derivedMarkup: cost > 0 ? Math.round(((rev - cost) / cost) * 10000) / 100 : 0,
        derivedMargin: marginPct,
      };
    }
  }, [cost, revenue, markupPct, marginPct, lastChanged]);

  const profit = derivedRevenue - cost;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button size="sm" variant="outline" onClick={() => { setCost(50); setRevenue(100); setMarkupPct(100); setMarginPct(50); setLastChanged("cost"); }}>Reset</Button>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div><Label className="text-sm mb-1 block">Cost ($)</Label><Input type="number" min={0} step={0.01} value={cost} onChange={(e) => { setCost(Number(e.target.value)); setLastChanged("cost"); }} /></div>
        <div><Label className="text-sm mb-1 block">Revenue ($)</Label><Input type="number" min={0} step={0.01} value={derivedRevenue} onChange={(e) => { setRevenue(Number(e.target.value)); setLastChanged("revenue"); }} /></div>
        <div><Label className="text-sm mb-1 block">Markup (%)</Label><Input type="number" step={0.1} value={derivedMarkup} onChange={(e) => { setMarkupPct(Number(e.target.value)); setLastChanged("markup"); }} /></div>
        <div><Label className="text-sm mb-1 block">Margin (%)</Label><Input type="number" step={0.1} value={derivedMargin} onChange={(e) => { setMarginPct(Number(e.target.value)); setLastChanged("margin"); }} /></div>
      </div>
      <Card className="p-4 text-center">
        <div className="text-2xl font-bold tabular-nums">${profit.toFixed(2)}</div>
        <div className="text-xs text-muted-foreground">Profit</div>
      </Card>
    </div>
  );
}
