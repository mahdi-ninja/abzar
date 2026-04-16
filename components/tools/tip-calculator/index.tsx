"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

export default function TipCalculator() {
  const t = useTranslations("tipCalculator");
  const [bill, setBill] = useState(50);
  const [tipPct, setTipPct] = useState(18);
  const [people, setPeople] = useState(1);

  const result = useMemo(() => {
    const tip = bill * (tipPct / 100);
    const total = bill + tip;
    const perPerson = people > 0 ? total / people : total;
    const tipPerPerson = people > 0 ? tip / people : tip;
    return { tip, total, perPerson, tipPerPerson };
  }, [bill, tipPct, people]);

  const fmt = (n: number) => `$${n.toFixed(2)}`;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button size="sm" variant="outline" onClick={() => { setBill(50); setTipPct(18); setPeople(1); }}>{t("reset")}</Button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <Label className="text-sm mb-1 block">{t("billAmount")}</Label>
          <Input type="number" min={0} step={0.01} value={bill} onChange={(e) => setBill(Number(e.target.value))} />
        </div>
        <div>
          <Label className="text-sm mb-1 block">{t("tipLabel", { pct: tipPct })}</Label>
          <Slider value={[tipPct]} onValueChange={(v) => setTipPct(Array.isArray(v) ? v[0] : v)} min={0} max={50} step={1} />
          <div className="flex gap-1 mt-2">
            {[10, 15, 18, 20, 25].map((p) => (
              <button key={p} onClick={() => setTipPct(p)} className={`h-7 px-2 rounded border text-xs ${tipPct === p ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"}`}>{p}%</button>
            ))}
          </div>
        </div>
        <div>
          <Label className="text-sm mb-1 block">{t("splitBetween")}</Label>
          <Input type="number" min={1} max={50} value={people} onChange={(e) => setPeople(Math.max(1, Number(e.target.value)))} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="p-3 text-center"><div className="text-2xl font-bold tabular-nums">{fmt(result.tip)}</div><div className="text-xs text-muted-foreground">{t("tip")}</div></Card>
        <Card className="p-3 text-center"><div className="text-2xl font-bold tabular-nums">{fmt(result.total)}</div><div className="text-xs text-muted-foreground">{t("total")}</div></Card>
        <Card className="p-3 text-center"><div className="text-2xl font-bold tabular-nums">{fmt(result.perPerson)}</div><div className="text-xs text-muted-foreground">{t("perPerson")}</div></Card>
        <Card className="p-3 text-center"><div className="text-2xl font-bold tabular-nums">{fmt(result.tipPerPerson)}</div><div className="text-xs text-muted-foreground">{t("tipPerPerson")}</div></Card>
      </div>
    </div>
  );
}
