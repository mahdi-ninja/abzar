"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useLocalStorage } from "@/lib/use-local-storage";

interface Habit {
  id: string;
  name: string;
  completedDates: string[]; // ISO date strings
}

function toDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(toDateKey(d));
  }
  return days;
}

function getStreak(habit: Habit): number {
  let streak = 0;
  const d = new Date();
  while (true) {
    const key = toDateKey(d);
    if (habit.completedDates.includes(key)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

function getLast90Days(): string[] {
  const days: string[] = [];
  for (let i = 89; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(toDateKey(d));
  }
  return days;
}

export default function HabitTracker() {
  const t = useTranslations("habitTracker");
  const [habits, setHabits] = useLocalStorage<Habit[]>("abzar:habit-tracker:habits", []);
  const [newHabitName, setNewHabitName] = useState("");

  const [dateKey, setDateKey] = useState(() => toDateKey(new Date()));

  // Recompute dates when the tab becomes visible (handles midnight rollover)
  useEffect(() => {
    const handler = () => {
      if (!document.hidden) setDateKey(toDateKey(new Date()));
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, []);

  const today = dateKey;
  // dateKey changes on visibility change (midnight rollover) to trigger recomputation
  const last7 = useMemo(() => { void dateKey; return getLast7Days(); }, [dateKey]);
  const last90 = useMemo(() => { void dateKey; return getLast90Days(); }, [dateKey]);

  const addHabit = useCallback(() => {
    const name = newHabitName.trim();
    if (!name) return;
    setHabits((prev) => [
      ...prev,
      { id: Date.now().toString(), name, completedDates: [] },
    ]);
    setNewHabitName("");
  }, [newHabitName, setHabits]);

  const removeHabit = useCallback(
    (id: string) => setHabits((prev) => prev.filter((h) => h.id !== id)),
    [setHabits]
  );

  const toggleDay = useCallback(
    (habitId: string, dateKey: string) => {
      setHabits((prev) =>
        prev.map((h) => {
          if (h.id !== habitId) return h;
          const has = h.completedDates.includes(dateKey);
          return {
            ...h,
            completedDates: has
              ? h.completedDates.filter((d) => d !== dateKey)
              : [...h.completedDates, dateKey],
          };
        })
      );
    },
    [setHabits]
  );

  return (
    <div className="space-y-6">
      {/* Add habit */}
      <div className="flex gap-2">
        <Input
          value={newHabitName}
          onChange={(e) => setNewHabitName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addHabit()}
          placeholder={t("placeholder")}
          className="text-sm"
        />
        <Button size="sm" onClick={addHabit} disabled={!newHabitName.trim()}>
          {t("add")}
        </Button>
      </div>

      {habits.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">
          {t("emptyState")}
        </p>
      )}

      {/* Weekly check-in grid */}
      {habits.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">{t("thisWeek")}</Label>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-start font-medium pe-4 pb-2">{t("habit")}</th>
                  {last7.map((day) => (
                    <th key={day} className="text-center font-normal text-xs text-muted-foreground pb-2 px-1">
                      {new Date(day + "T12:00:00").toLocaleDateString(undefined, { weekday: "short" })}
                    </th>
                  ))}
                  <th className="text-center font-normal text-xs text-muted-foreground pb-2 px-2">{t("streak")}</th>
                  <th className="pb-2" />
                </tr>
              </thead>
              <tbody>
                {habits.map((habit) => (
                  <tr key={habit.id}>
                    <td className="pe-4 py-1 font-medium text-sm truncate max-w-37.5">
                      {habit.name}
                    </td>
                    {last7.map((day) => {
                      const done = habit.completedDates.includes(day);
                      return (
                        <td key={day} className="text-center px-1 py-1">
                          <button
                            onClick={() => toggleDay(habit.id, day)}
                            className={`h-7 w-7 rounded-md border text-xs transition-colors ${
                              done
                                ? "bg-primary text-primary-foreground border-primary"
                                : day === today
                                ? "border-primary/50 hover:bg-primary/10"
                                : "border-border hover:bg-muted"
                            }`}
                          >
                            {done ? "✓" : ""}
                          </button>
                        </td>
                      );
                    })}
                    <td className="text-center px-2 py-1">
                      <span className="text-sm font-bold tabular-nums">
                        {getStreak(habit)}
                      </span>
                    </td>
                    <td className="py-1">
                      <button
                        onClick={() => removeHabit(habit.id)}
                        className="text-muted-foreground hover:text-destructive text-xs"
                        aria-label={t("removeHabit")}
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Heatmap (first habit) */}
      {habits.length > 0 && (
        <Card className="p-4">
          <Label className="text-sm font-medium mb-2 block">
            {t("heatmapTitle", { name: habits[0].name })}
          </Label>
          <div className="flex flex-wrap gap-0.5">
            {last90.map((day) => {
              const count = habits.filter((h) =>
                h.completedDates.includes(day)
              ).length;
              const intensity =
                count === 0
                  ? "bg-muted"
                  : count === 1
                  ? "bg-primary/30"
                  : count <= 3
                  ? "bg-primary/60"
                  : "bg-primary";
              return (
                <div
                  key={day}
                  className={`h-3 w-3 rounded-sm ${intensity}`}
                  title={t("heatmapTooltip", { day, count })}
                />
              );
            })}
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <span>{t("less")}</span>
            <div className="h-3 w-3 rounded-sm bg-muted" />
            <div className="h-3 w-3 rounded-sm bg-primary/30" />
            <div className="h-3 w-3 rounded-sm bg-primary/60" />
            <div className="h-3 w-3 rounded-sm bg-primary" />
            <span>{t("more")}</span>
          </div>
        </Card>
      )}
    </div>
  );
}
