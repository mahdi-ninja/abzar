"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AgeCalculator() {
  const t = useTranslations("ageCalculator");
  const [birthdate, setBirthdate] = useState("1990-01-15");

  const result = useMemo(() => {
    const birth = new Date(birthdate + "T00:00:00");
    if (isNaN(birth.getTime())) return null;
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    let days = now.getDate() - birth.getDate();
    if (days < 0) { months--; days += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }
    if (months < 0) { years--; months += 12; }
    const totalDays = Math.floor((now.getTime() - birth.getTime()) / 86400000);
    const totalHours = totalDays * 24;
    const nextBirthday = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
    if (nextBirthday <= now) nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
    const daysUntilBirthday = Math.ceil((nextBirthday.getTime() - now.getTime()) / 86400000);
    return { years, months, days, totalDays, totalHours, daysUntilBirthday };
  }, [birthdate]);

  return (
    <div className="space-y-6">
      <div className="flex items-end gap-3">
        <div><Label className="text-sm mb-1 block">{t("dateOfBirth")}</Label><Input type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} className="w-48" /></div>
        <Button size="sm" variant="outline" onClick={() => setBirthdate("1990-01-15")}>{t("reset")}</Button>
      </div>
      {result && (
        <>
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold">{t("ageFormat", { years: result.years, months: result.months, days: result.days })}</div>
          </Card>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Card className="p-3 text-center"><div className="text-xl font-bold tabular-nums">{result.totalDays.toLocaleString()}</div><div className="text-xs text-muted-foreground">{t("totalDaysAlive")}</div></Card>
            <Card className="p-3 text-center"><div className="text-xl font-bold tabular-nums">{result.totalHours.toLocaleString()}</div><div className="text-xs text-muted-foreground">{t("totalHoursAlive")}</div></Card>
            <Card className="p-3 text-center"><div className="text-xl font-bold tabular-nums">{result.daysUntilBirthday}</div><div className="text-xs text-muted-foreground">{t("daysUntilBirthday")}</div></Card>
          </div>
        </>
      )}
    </div>
  );
}
