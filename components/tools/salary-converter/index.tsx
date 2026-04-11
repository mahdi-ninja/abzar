"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SalaryConverter() {
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
      { label: "Hourly", value: hourly },
      { label: "Daily (8h)", value: daily },
      { label: "Weekly", value: weekly },
      { label: "Bi-weekly", value: biweekly },
      { label: "Monthly", value: monthly },
      { label: "Annual", value: annual },
    ];
  }, [amount, hoursPerWeek, weeksPerYear]);

  const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 2 });

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button size="sm" variant="outline" onClick={() => { setAmount(75000); setHoursPerWeek(40); setWeeksPerYear(52); }}>Reset</Button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <Label className="text-sm mb-1 block">Annual Salary ($)</Label>
          <Input type="number" min={0} value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
        </div>
        <div>
          <Label className="text-sm mb-1 block">Hours/week</Label>
          <Input type="number" min={1} max={80} value={hoursPerWeek} onChange={(e) => setHoursPerWeek(Number(e.target.value))} />
        </div>
        <div>
          <Label className="text-sm mb-1 block">Weeks/year</Label>
          <Input type="number" min={1} max={52} value={weeksPerYear} onChange={(e) => setWeeksPerYear(Number(e.target.value))} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {conversions.map(({ label, value }) => (
          <Card key={label} className="p-3 text-center">
            <div className="text-xl font-bold tabular-nums">{fmt(value)}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
