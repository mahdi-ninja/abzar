"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

export default function MarkupMargin() {
  const [cost, setCost] = useState(50);
  const [revenue, setRevenue] = useState(100);
  const [markupPct, setMarkupPct] = useState(100);
  const [marginPct, setMarginPct] = useState(50);
  const [lastChanged, setLastChanged] = useState<"cost" | "revenue" | "markup" | "margin">("cost");

  useEffect(() => {
    if (lastChanged === "cost" || lastChanged === "revenue") {
      if (cost > 0) {
        setMarkupPct(Math.round(((revenue - cost) / cost) * 10000) / 100);
        setMarginPct(revenue > 0 ? Math.round(((revenue - cost) / revenue) * 10000) / 100 : 0);
      }
    } else if (lastChanged === "markup") {
      const rev = cost * (1 + markupPct / 100);
      setRevenue(Math.round(rev * 100) / 100);
      setMarginPct(rev > 0 ? Math.round(((rev - cost) / rev) * 10000) / 100 : 0);
    } else if (lastChanged === "margin") {
      const rev = marginPct < 100 ? cost / (1 - marginPct / 100) : 0;
      setRevenue(Math.round(rev * 100) / 100);
      setMarkupPct(cost > 0 ? Math.round(((rev - cost) / cost) * 10000) / 100 : 0);
    }
  }, [cost, revenue, markupPct, marginPct, lastChanged]);

  const profit = revenue - cost;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div><Label className="text-sm mb-1 block">Cost ($)</Label><Input type="number" min={0} step={0.01} value={cost} onChange={(e) => { setCost(Number(e.target.value)); setLastChanged("cost"); }} /></div>
        <div><Label className="text-sm mb-1 block">Revenue ($)</Label><Input type="number" min={0} step={0.01} value={revenue} onChange={(e) => { setRevenue(Number(e.target.value)); setLastChanged("revenue"); }} /></div>
        <div><Label className="text-sm mb-1 block">Markup (%)</Label><Input type="number" step={0.1} value={markupPct} onChange={(e) => { setMarkupPct(Number(e.target.value)); setLastChanged("markup"); }} /></div>
        <div><Label className="text-sm mb-1 block">Margin (%)</Label><Input type="number" step={0.1} value={marginPct} onChange={(e) => { setMarginPct(Number(e.target.value)); setLastChanged("margin"); }} /></div>
      </div>
      <Card className="p-4 text-center">
        <div className="text-2xl font-bold tabular-nums">${profit.toFixed(2)}</div>
        <div className="text-xs text-muted-foreground">Profit</div>
      </Card>
    </div>
  );
}
