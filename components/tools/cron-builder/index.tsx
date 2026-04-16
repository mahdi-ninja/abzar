"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CopyButton } from "@/components/ui/copy-button";
import { Card } from "@/components/ui/card";

const FIELDS = [
  { key: "minute", labelKey: "minute", min: 0, max: 59, defaultVal: "0" },
  { key: "hour", labelKey: "hour", min: 0, max: 23, defaultVal: "*" },
  { key: "day", labelKey: "dayOfMonth", min: 1, max: 31, defaultVal: "*" },
  { key: "month", labelKey: "month", min: 1, max: 12, defaultVal: "*" },
  { key: "weekday", labelKey: "dayOfWeek", min: 0, max: 6, defaultVal: "*" },
] as const;

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function describeCron(parts: string[], t: (key: string, params?: Record<string, string | number>) => string): string {
  if (parts.length !== 5) return t("descInvalid");
  const [minute, hour, day, month, weekday] = parts;

  const pieces: string[] = [];

  // Minute
  if (minute === "*") pieces.push(t("descEveryMinute"));
  else if (minute.includes("/")) pieces.push(t("descEveryNMinutes", { step: minute.split("/")[1] }));
  else pieces.push(t("descAtMinute", { minute }));

  // Hour
  if (hour === "*") pieces.push(t("descEveryHour"));
  else if (hour.includes("/")) pieces.push(t("descEveryNHours", { step: hour.split("/")[1] }));
  else pieces.push(t("descAtTime", { time: `${hour.padStart(2, "0")}:${minute === "*" ? "00" : minute.padStart(2, "0")}` }));

  // Day of month
  if (day !== "*") {
    if (day.includes("/")) pieces.push(t("descEveryNDays", { step: day.split("/")[1] }));
    else pieces.push(t("descOnDay", { day }));
  }

  // Month
  if (month !== "*") {
    const m = parseInt(month, 10);
    pieces.push(t("descInMonth", { month: MONTHS[m] || month }));
  }

  // Weekday
  if (weekday !== "*") {
    if (weekday.includes("-")) {
      const [from, to] = weekday.split("-").map(Number);
      pieces.push(t("descWeekdayRange", { from: WEEKDAYS[from], to: WEEKDAYS[to] }));
    } else if (weekday.includes(",")) {
      const days = weekday.split(",").map((d) => WEEKDAYS[parseInt(d, 10)] || d);
      pieces.push(t("descOnWeekdays", { weekdays: days.join(", ") }));
    } else {
      pieces.push(t("descOnWeekday", { weekday: WEEKDAYS[parseInt(weekday, 10)] || weekday }));
    }
  }

  return pieces.join(" ");
}

function getNextRuns(expression: string, count: number): Date[] {
  const parts = expression.split(" ");
  if (parts.length !== 5) return [];

  const dates: Date[] = [];
  const now = new Date();
  const check = new Date(now);
  check.setSeconds(0, 0);
  check.setMinutes(check.getMinutes() + 1);

  const matches = (val: number, field: string, min: number): boolean => {
    if (field === "*") return true;
    if (field.includes("/")) {
      const [base, step] = field.split("/").map(Number);
      return (val - (isNaN(base) ? min : base)) % step === 0 && val >= (isNaN(base) ? min : base);
    }
    if (field.includes(",")) return field.split(",").map(Number).includes(val);
    if (field.includes("-")) {
      const [from, to] = field.split("-").map(Number);
      return val >= from && val <= to;
    }
    return val === parseInt(field, 10);
  };

  let iterations = 0;
  while (dates.length < count && iterations < 525600) {
    iterations++;
    const min = check.getMinutes();
    const hr = check.getHours();
    const dom = check.getDate();
    const mon = check.getMonth() + 1;
    const dow = check.getDay();

    if (
      matches(min, parts[0], 0) &&
      matches(hr, parts[1], 0) &&
      matches(dom, parts[2], 1) &&
      matches(mon, parts[3], 1) &&
      matches(dow, parts[4], 0)
    ) {
      dates.push(new Date(check));
    }
    check.setMinutes(check.getMinutes() + 1);
  }
  return dates;
}

export default function CronBuilder() {
  const t = useTranslations("cronBuilder");
  const [fields, setFields] = useState({
    minute: "0",
    hour: "*",
    day: "*",
    month: "*",
    weekday: "*",
  });

  const expression = `${fields.minute} ${fields.hour} ${fields.day} ${fields.month} ${fields.weekday}`;
  const description = useMemo(() => describeCron(expression.split(" "), t), [expression, t]);
  const nextRuns = useMemo(() => getNextRuns(expression, 5), [expression]);

  const updateField = (key: string, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  // Presets
  const presets = [
    { labelKey: "presetEveryMinute" as const, value: "* * * * *" },
    { labelKey: "presetEveryHour" as const, value: "0 * * * *" },
    { labelKey: "presetDailyMidnight" as const, value: "0 0 * * *" },
    { labelKey: "presetMondayMorning" as const, value: "0 9 * * 1" },
    { labelKey: "presetEvery5Minutes" as const, value: "*/5 * * * *" },
    { labelKey: "presetMonthly" as const, value: "0 0 1 * *" },
  ];

  const applyPreset = (expr: string) => {
    const parts = expr.split(" ");
    setFields({
      minute: parts[0],
      hour: parts[1],
      day: parts[2],
      month: parts[3],
      weekday: parts[4],
    });
  };

  return (
    <div className="space-y-6">
      {/* Expression display */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">{t("expression")}</Label>
          <CopyButton value={expression} />
        </div>
        <div className="rounded-md border bg-muted/50 p-3 font-mono text-lg text-center">
          {expression}
        </div>
        <p className="text-sm text-muted-foreground text-center">{description}</p>
      </div>

      {/* Field editors */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {FIELDS.map(({ key, labelKey }) => (
          <div key={key}>
            <Label className="text-xs mb-1 block">{t(labelKey)}</Label>
            <Input
              value={fields[key as keyof typeof fields]}
              onChange={(e) => updateField(key, e.target.value)}
              className="font-mono text-sm text-center"
            />
          </div>
        ))}
      </div>

      {/* Presets */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">{t("presets")}</Label>
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p.value}
              onClick={() => applyPreset(p.value)}
              className="rounded-md border bg-muted/50 px-2.5 py-1 text-xs hover:bg-accent transition-colors"
            >
              {t(p.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* Next runs */}
      {nextRuns.length > 0 && (
        <Card className="p-4">
          <Label className="text-sm font-medium mb-2 block">
            {t("nextRuns")}
          </Label>
          <div className="space-y-1 font-mono text-sm">
            {nextRuns.map((d, i) => (
              <div key={i} className="text-muted-foreground">
                {d.toLocaleString()}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
