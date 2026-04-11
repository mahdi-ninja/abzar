"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CopyButton } from "@/components/ui/copy-button";

const ROMAN_MAP: [number, string][] = [[1000,"M"],[900,"CM"],[500,"D"],[400,"CD"],[100,"C"],[90,"XC"],[50,"L"],[40,"XL"],[10,"X"],[9,"IX"],[5,"V"],[4,"IV"],[1,"I"]];

function toRoman(n: number): string {
  if (n <= 0 || n > 3999) return "";
  let result = "";
  for (const [val, sym] of ROMAN_MAP) {
    while (n >= val) { result += sym; n -= val; }
  }
  return result;
}

function fromRoman(s: string): number {
  const map: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let total = 0;
  const upper = s.toUpperCase();
  for (let i = 0; i < upper.length; i++) {
    const curr = map[upper[i]];
    const next = map[upper[i + 1]];
    if (!curr) return NaN;
    if (next && curr < next) { total -= curr; } else { total += curr; }
  }
  return total;
}

export default function RomanNumerals() {
  const [arabic, setArabic] = useState("2024");
  const [roman, setRoman] = useState("MMXXIV");

  const arabicToRoman = useMemo(() => {
    const n = parseInt(arabic, 10);
    return isNaN(n) ? "" : toRoman(n);
  }, [arabic]);

  const romanToArabic = useMemo(() => {
    const n = fromRoman(roman);
    return isNaN(n) ? "" : String(n);
  }, [roman]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-sm">Arabic Number</Label>
          <Input type="number" min={1} max={3999} value={arabic} onChange={(e) => setArabic(e.target.value)} className="font-mono text-lg" />
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">→ Roman:</span>
            <code className="font-mono text-lg font-bold">{arabicToRoman || "—"}</code>
            {arabicToRoman && <CopyButton value={arabicToRoman} label="" />}
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-sm">Roman Numeral</Label>
          <Input value={roman} onChange={(e) => setRoman(e.target.value.toUpperCase())} className="font-mono text-lg" placeholder="MMXXIV" />
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">→ Arabic:</span>
            <code className="font-mono text-lg font-bold">{romanToArabic || "—"}</code>
            {romanToArabic && <CopyButton value={romanToArabic} label="" />}
          </div>
        </div>
      </div>
    </div>
  );
}
