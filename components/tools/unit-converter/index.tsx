"use client";

import { useState, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

type UnitCategory = {
  units: { key: string; factor: number }[];
  isTemperature?: boolean;
};

const unitCategories: Record<string, UnitCategory> = {
  length: {
    units: [
      { key: "mm", factor: 0.001 },
      { key: "cm", factor: 0.01 },
      { key: "m", factor: 1 },
      { key: "km", factor: 1000 },
      { key: "in", factor: 0.0254 },
      { key: "ft", factor: 0.3048 },
      { key: "yd", factor: 0.9144 },
      { key: "mi", factor: 1609.344 },
    ],
  },
  weight: {
    units: [
      { key: "mg", factor: 0.000001 },
      { key: "g", factor: 0.001 },
      { key: "kg", factor: 1 },
      { key: "t", factor: 1000 },
      { key: "oz", factor: 0.0283495 },
      { key: "lb", factor: 0.453592 },
      { key: "st", factor: 6.35029 },
    ],
  },
  volume: {
    units: [
      { key: "ml", factor: 0.001 },
      { key: "l", factor: 1 },
      { key: "gal_us", factor: 3.78541 },
      { key: "gal_uk", factor: 4.54609 },
      { key: "qt", factor: 0.946353 },
      { key: "pt", factor: 0.473176 },
      { key: "cup", factor: 0.236588 },
      { key: "fl_oz", factor: 0.0295735 },
    ],
  },
  temperature: {
    isTemperature: true,
    units: [
      { key: "c", factor: 0 },
      { key: "f", factor: 0 },
      { key: "k", factor: 0 },
    ],
  },
  speed: {
    units: [
      { key: "ms", factor: 1 },
      { key: "kmh", factor: 0.277778 },
      { key: "mph", factor: 0.44704 },
      { key: "kn", factor: 0.514444 },
      { key: "fts", factor: 0.3048 },
    ],
  },
  area: {
    units: [
      { key: "sqm", factor: 1 },
      { key: "sqkm", factor: 1000000 },
      { key: "sqft", factor: 0.092903 },
      { key: "sqmi", factor: 2589988 },
      { key: "acre", factor: 4046.86 },
      { key: "ha", factor: 10000 },
    ],
  },
  data: {
    units: [
      { key: "b", factor: 1 },
      { key: "kb", factor: 1024 },
      { key: "mb", factor: 1048576 },
      { key: "gb", factor: 1073741824 },
      { key: "tb", factor: 1099511627776 },
    ],
  },
};

function convertTemperature(value: number, from: string, to: string): number {
  // Convert to Celsius first
  let celsius = value;
  if (from === "f") celsius = (value - 32) * (5 / 9);
  else if (from === "k") celsius = value - 273.15;

  // Convert from Celsius to target
  if (to === "c") return celsius;
  if (to === "f") return celsius * (9 / 5) + 32;
  return celsius + 273.15;
}

export default function UnitConverter() {
  const t = useTranslations("unitConverter");
  const [category, setCategory] = useState("length");
  const [fromUnit, setFromUnit] = useState("m");
  const [toUnit, setToUnit] = useState("ft");
  const [value, setValue] = useState("1");

  const cat = unitCategories[category];
  const units = cat.units;

  const result = useMemo(() => {
    const num = parseFloat(value);
    if (isNaN(num)) return "";

    if (cat.isTemperature) {
      return convertTemperature(num, fromUnit, toUnit).toFixed(4).replace(/\.?0+$/, "");
    }

    const fromFactor = units.find((u) => u.key === fromUnit)?.factor ?? 1;
    const toFactor = units.find((u) => u.key === toUnit)?.factor ?? 1;
    const base = num * fromFactor;
    return (base / toFactor).toFixed(6).replace(/\.?0+$/, "");
  }, [value, fromUnit, toUnit, cat, units]);

  const handleSwap = useCallback(() => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  }, [fromUnit, toUnit]);

  const handleCategoryChange = useCallback((newCat: string) => {
    setCategory(newCat);
    const newUnits = unitCategories[newCat].units;
    setFromUnit(newUnits[0].key);
    setToUnit(newUnits[1]?.key ?? newUnits[0].key);
    setValue("1");
  }, []);

  return (
    <div className="space-y-6">
      <Tabs value={category} onValueChange={handleCategoryChange}>
        <TabsList className="h-8 flex-wrap">
          {Object.keys(unitCategories).map((key) => (
            <TabsTrigger key={key} value={key} className="text-xs px-2.5 h-6">
              {t(`cat_${key}`)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
        {/* From */}
        <div className="space-y-2">
          <Label className="text-sm">{t("from")}</Label>
          <Select value={fromUnit} onValueChange={(v) => v && setFromUnit(v)}>
            <SelectTrigger>
              <span>{t(`unit_${fromUnit}`)}</span>
            </SelectTrigger>
            <SelectContent>
              {units.map((u) => (
                <SelectItem key={u.key} value={u.key}>
                  {t(`unit_${u.key}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="font-mono text-lg"
          />
        </div>

        {/* Swap + Reset */}
        <div className="flex flex-col gap-2 self-center">
        <Button
          variant="outline"
          size="icon"
          onClick={handleSwap}
          className=""
          aria-label={t("swapUnits")}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </Button>
        <Button variant="outline" size="sm" onClick={() => handleCategoryChange(category)} className="text-xs">{t("reset")}</Button>
        </div>

        {/* To */}
        <div className="space-y-2">
          <Label className="text-sm">{t("to")}</Label>
          <Select value={toUnit} onValueChange={(v) => v && setToUnit(v)}>
            <SelectTrigger>
              <span>{t(`unit_${toUnit}`)}</span>
            </SelectTrigger>
            <SelectContent>
              {units.map((u) => (
                <SelectItem key={u.key} value={u.key}>
                  {t(`unit_${u.key}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            value={result}
            readOnly
            className="font-mono text-lg bg-muted/50"
          />
        </div>
      </div>
    </div>
  );
}
