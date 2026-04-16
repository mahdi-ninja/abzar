"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type ConversionKey = "hourly" | "daily" | "weekly" | "biweekly" | "monthly" | "annual";

export default function SalaryConverter() {
  const t = useTranslations("salaryConverter");
  const [amount, setAmount] = useState(75000);
  const [hoursPerWeek, setHoursPerWeek] = useState(40);
  const [weeksPerYear, setWeeksPerYear] = useState(52);

  const conversions = useMemo(() => {
    const hourly = amount / (weeksPerYear * hoursPerWeek);
    const daily = hourly * 8;
    const weekly = hourly * hoursPerWeek;
    const biweekly = weekly * 2;
    const monthly = amount / 12;
    const annual = amount;
    return [
      { key: "hourly" as ConversionKey, value: hourly },
      { key: "daily" as ConversionKey, value: daily },
      { key: "weekly" as ConversionKey, value: weekly },
      { key: "biweekly" as ConversionKey, value: biweekly },
      { key: "monthly" as ConversionKey, value: monthly },
      { key: "annual" as ConversionKey, value: annual },
    ];
  }, [amount, hoursPerWeek, weeksPerYear]);

  const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 2 });

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button size="sm" variant="outline" onClick={() => { setAmount(75000); setHoursPerWeek(40); setWeeksPerYear(52); }}>{t("reset")}</Button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <Label className="text-sm mb-1 block">{t("annualSalary")}</Label>
          <Input type="number" min={0} value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
        </div>
        <div>
          <Label className="text-sm mb-1 block">{t("hoursPerWeek")}</Label>
          <Input type="number" min={1} max={80} value={hoursPerWeek} onChange={(e) => setHoursPerWeek(Number(e.target.value))} />
        </div>
        <div>
          <Label className="text-sm mb-1 block">{t("weeksPerYear")}</Label>
          <Input type="number" min={1} max={52} value={weeksPerYear} onChange={(e) => setWeeksPerYear(Number(e.target.value))} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {conversions.map(({ key, value }) => (
          <Card key={key} className="p-3 text-center">
            <div className="text-xl font-bold tabular-nums">{fmt(value)}</div>
            <div className="text-xs text-muted-foreground">{t(key)}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
