"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

const DICE = [
  { sides: 4, color: "from-emerald-500 to-emerald-700", label: "d4" },
  { sides: 6, color: "from-blue-500 to-blue-700", label: "d6" },
  { sides: 8, color: "from-violet-500 to-violet-700", label: "d8" },
  { sides: 10, color: "from-amber-500 to-amber-700", label: "d10" },
  { sides: 12, color: "from-rose-500 to-rose-700", label: "d12" },
  { sides: 20, color: "from-red-600 to-red-800", label: "d20" },
  { sides: 100, color: "from-gray-500 to-gray-700", label: "d100" },
];

function roll(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

// Pip layout for d6 faces
const D6_PIPS: Record<number, [number, number][]> = {
  1: [[1, 1]],
  2: [[0, 2], [2, 0]],
  3: [[0, 2], [1, 1], [2, 0]],
  4: [[0, 0], [0, 2], [2, 0], [2, 2]],
  5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
  6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
};

function DieVisual({ sides, value, rolling }: { sides: number; value: number; rolling: boolean }) {
  const dice = DICE.find((d) => d.sides === sides)!;
  const animClass = rolling ? "animate-bounce" : "";

  // d6 gets pip faces
  if (sides === 6 && value >= 1 && value <= 6) {
    const pips = D6_PIPS[value];
    return (
      <div className={`relative h-16 w-16 rounded-xl bg-linear-to-br ${dice.color} shadow-lg flex items-center justify-center ${animClass}`}>
        <div className="grid grid-cols-3 grid-rows-3 gap-0.5 h-10 w-10">
          {Array.from({ length: 9 }, (_, i) => {
            const row = Math.floor(i / 3);
            const col = i % 3;
            const hasPip = pips.some(([r, c]) => r === row && c === col);
            return (
              <div key={i} className="flex items-center justify-center">
                {hasPip && <div className="h-2.5 w-2.5 rounded-full bg-white shadow-sm" />}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // d20 gets a special icosahedron-ish shape
  if (sides === 20) {
    return (
      <div className={`relative h-16 w-16 ${animClass}`}>
        <div className="absolute inset-0 bg-linear-to-br from-red-600 to-red-800 shadow-lg"
          style={{ clipPath: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)" }}
        />
        <div className="absolute inset-0 flex items-center justify-center pt-1">
          <span className="text-white font-bold text-lg tabular-nums drop-shadow-md">
            {value}
          </span>
        </div>
        {value === 20 && (
          <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-amber-400 flex items-center justify-center">
            <span className="text-[8px] font-bold text-amber-900">!</span>
          </div>
        )}
        {value === 1 && (
          <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-400 flex items-center justify-center">
            <span className="text-[8px] font-bold text-red-900">×</span>
          </div>
        )}
      </div>
    );
  }

  // d4 gets a triangle
  if (sides === 4) {
    return (
      <div className={`relative h-16 w-16 ${animClass}`}>
        <div className="absolute inset-0 bg-linear-to-br from-emerald-500 to-emerald-700 shadow-lg"
          style={{ clipPath: "polygon(50% 5%, 95% 90%, 5% 90%)" }}
        />
        <div className="absolute inset-0 flex items-center justify-center pt-3">
          <span className="text-white font-bold text-lg tabular-nums drop-shadow-md">{value}</span>
        </div>
      </div>
    );
  }

  // d8/d10/d12 get a diamond shape
  if (sides === 8 || sides === 10 || sides === 12) {
    return (
      <div className={`relative h-16 w-16 ${animClass}`}>
        <div className={`absolute inset-1 bg-linear-to-br ${dice.color} shadow-lg rotate-45 rounded-md`} />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-bold text-lg tabular-nums drop-shadow-md">{value}</span>
        </div>
      </div>
    );
  }

  // d100 gets a circle
  return (
    <div className={`relative h-16 w-16 rounded-full bg-linear-to-br ${dice.color} shadow-lg flex items-center justify-center ${animClass}`}>
      <span className="text-white font-bold text-lg tabular-nums drop-shadow-md">{value}</span>
    </div>
  );
}

interface RollResult {
  id: number;
  sides: number;
  values: number[];
  total: number;
  rolling: boolean;
}

export default function DiceRoller() {
  const t = useTranslations("diceRoller");
  const [quantity, setQuantity] = useState(1);
  const [results, setResults] = useState<RollResult[]>([]);
  const [nextId, setNextId] = useState(0);

  const handleRoll = useCallback((sides: number) => {
    const values = Array.from({ length: quantity }, () => roll(sides));
    const total = values.reduce((a, b) => a + b, 0);
    const id = nextId;
    setNextId((n) => n + 1);

    // Add with rolling animation
    setResults((prev) => [{ id, sides, values, total, rolling: true }, ...prev].slice(0, 20));

    // Stop animation after a moment
    setTimeout(() => {
      setResults((prev) =>
        prev.map((r) => (r.id === id ? { ...r, rolling: false } : r))
      );
    }, 500);
  }, [quantity, nextId]);

  return (
    <div className="space-y-6">
      {/* Dice buttons */}
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <Label className="text-xs mb-1 block">{t("quantity")}</Label>
          <Input
            type="number"
            min={1}
            max={20}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Math.min(20, Number(e.target.value))))}
            className="w-20 text-sm"
          />
        </div>
        {DICE.map((d) => (
          <Button
            key={d.sides}
            size="sm"
            onClick={() => handleRoll(d.sides)}
            className={`font-mono font-bold bg-linear-to-br ${d.color} text-white border-0 hover:opacity-90`}
          >
            {d.label}
          </Button>
        ))}
        <Button size="sm" variant="ghost" onClick={() => setResults([])}>
          {t("clear")}
        </Button>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-3">
          {results.map((r) => {
            const isNat20 = r.sides === 20 && r.values.includes(20);
            const isCritFail = r.sides === 20 && r.values.includes(1);
            return (
              <Card
                key={r.id}
                className={`p-4 ${isNat20 ? "ring-2 ring-amber-400 bg-amber-50 dark:bg-amber-950/20" : isCritFail ? "ring-2 ring-red-400 bg-red-50 dark:bg-red-950/20" : ""}`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-mono text-muted-foreground">
                    {quantity}{DICE.find((d) => d.sides === r.sides)?.label}
                  </span>
                  {isNat20 && <span className="text-xs font-bold text-amber-600">{t("nat20")}</span>}
                  {isCritFail && <span className="text-xs font-bold text-red-600">{t("critFail")}</span>}
                  <span className="ml-auto text-xl font-bold tabular-nums">
                    = {r.total}
                  </span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {r.values.map((v, j) => (
                    <DieVisual key={j} sides={r.sides} value={v} rolling={r.rolling} />
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {results.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <div className="text-4xl mb-3">🎲</div>
          <p className="text-sm">{t("emptyPrompt")}</p>
        </div>
      )}
    </div>
  );
}
