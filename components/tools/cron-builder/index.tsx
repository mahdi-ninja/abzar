"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CopyButton } from "@/components/ui/copy-button";
import { Card } from "@/components/ui/card";

const FIELDS = [
  { key: "minute", label: "Minute", min: 0, max: 59, defaultVal: "0" },
  { key: "hour", label: "Hour", min: 0, max: 23, defaultVal: "*" },
  { key: "day", label: "Day of Month", min: 1, max: 31, defaultVal: "*" },
  { key: "month", label: "Month", min: 1, max: 12, defaultVal: "*" },
  { key: "weekday", label: "Day of Week", min: 0, max: 6, defaultVal: "*" },
] as const;

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function describeCron(parts: string[]): string {
  if (parts.length !== 5) return "Invalid expression";
  const [minute, hour, day, month, weekday] = parts;

  const pieces: string[] = [];

  // Minute
  if (minute === "*") pieces.push("Every minute");
  else if (minute.includes("/")) pieces.push(`Every ${minute.split("/")[1]} minutes`);
  else pieces.push(`At minute ${minute}`);

  // Hour
  if (hour === "*") pieces.push("of every hour");
  else if (hour.includes("/")) pieces.push(`every ${hour.split("/")[1]} hours`);
  else pieces.push(`at ${hour.padStart(2, "0")}:${minute === "*" ? "00" : minute.padStart(2, "0")}`);

  // Day of month
  if (day !== "*") {
    if (day.includes("/")) pieces.push(`every ${day.split("/")[1]} days`);
    else pieces.push(`on day ${day}`);
  }

  // Month
  if (month !== "*") {
    const m = parseInt(month, 10);
    pieces.push(`in ${MONTHS[m] || month}`);
  }

  // Weekday
  if (weekday !== "*") {
    if (weekday.includes("-")) {
      const [from, to] = weekday.split("-").map(Number);
      pieces.push(`${WEEKDAYS[from]}–${WEEKDAYS[to]}`);
    } else if (weekday.includes(",")) {
      const days = weekday.split(",").map((d) => WEEKDAYS[parseInt(d, 10)] || d);
      pieces.push(`on ${days.join(", ")}`);
    } else {
      pieces.push(`on ${WEEKDAYS[parseInt(weekday, 10)] || weekday}`);
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
  const [fields, setFields] = useState({
    minute: "0",
    hour: "*",
    day: "*",
    month: "*",
    weekday: "*",
  });

  const expression = `${fields.minute} ${fields.hour} ${fields.day} ${fields.month} ${fields.weekday}`;
  const description = useMemo(() => describeCron(expression.split(" ")), [expression]);
  const nextRuns = useMemo(() => getNextRuns(expression, 5), [expression]);

  const updateField = (key: string, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  // Presets
  const presets = [
    { label: "Every minute", value: "* * * * *" },
    { label: "Every hour", value: "0 * * * *" },
    { label: "Every day at midnight", value: "0 0 * * *" },
    { label: "Every Monday at 9am", value: "0 9 * * 1" },
    { label: "Every 5 minutes", value: "*/5 * * * *" },
    { label: "1st of every month", value: "0 0 1 * *" },
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
          <Label className="text-sm font-medium">Expression</Label>
          <CopyButton value={expression} />
        </div>
        <div className="rounded-md border bg-muted/50 p-3 font-mono text-lg text-center">
          {expression}
        </div>
        <p className="text-sm text-muted-foreground text-center">{description}</p>
      </div>

      {/* Field editors */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {FIELDS.map(({ key, label }) => (
          <div key={key}>
            <Label className="text-xs mb-1 block">{label}</Label>
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
        <Label className="text-sm font-medium">Presets</Label>
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p.value}
              onClick={() => applyPreset(p.value)}
              className="rounded-md border bg-muted/50 px-2.5 py-1 text-xs hover:bg-accent transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Next runs */}
      {nextRuns.length > 0 && (
        <Card className="p-4">
          <Label className="text-sm font-medium mb-2 block">
            Next 5 Runs
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
