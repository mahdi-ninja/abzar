"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function RoiCalculator() {
  const t = useTranslations("roiCalculator");
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
      <div className="flex justify-end">
        <Button size="sm" variant="outline" onClick={() => { setInitial(10000); setFinal(15000); setYears(3); }}>{t("reset")}</Button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div><Label className="text-sm mb-1 block">{t("initialInvestment")}</Label><Input type="number" value={initial} onChange={(e) => setInitial(Number(e.target.value))} /></div>
        <div><Label className="text-sm mb-1 block">{t("finalValue")}</Label><Input type="number" value={final} onChange={(e) => setFinal(Number(e.target.value))} /></div>
        <div><Label className="text-sm mb-1 block">{t("years")}</Label><Input type="number" min={1} value={years} onChange={(e) => setYears(Number(e.target.value))} /></div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card className="p-4 text-center"><div className="text-2xl font-bold tabular-nums">{fmt(result.gain)}</div><div className="text-xs text-muted-foreground">{t("netGainLoss")}</div></Card>
        <Card className="p-4 text-center"><div className="text-2xl font-bold tabular-nums">{result.roi.toFixed(2)}%</div><div className="text-xs text-muted-foreground">{t("totalRoi")}</div></Card>
        <Card className="p-4 text-center"><div className="text-2xl font-bold tabular-nums">{result.annualized.toFixed(2)}%</div><div className="text-xs text-muted-foreground">{t("annualizedRoi")}</div></Card>
      </div>
    </div>
  );
}
