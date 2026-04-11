"use client";

import { useState, useMemo, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type UnitCategory = {
  name: string;
  units: { key: string; label: string; factor: number }[];
  isTemperature?: boolean;
};

const unitCategories: Record<string, UnitCategory> = {
  length: {
    name: "Length",
    units: [
      { key: "mm", label: "Millimeters", factor: 0.001 },
      { key: "cm", label: "Centimeters", factor: 0.01 },
      { key: "m", label: "Meters", factor: 1 },
      { key: "km", label: "Kilometers", factor: 1000 },
      { key: "in", label: "Inches", factor: 0.0254 },
      { key: "ft", label: "Feet", factor: 0.3048 },
      { key: "yd", label: "Yards", factor: 0.9144 },
      { key: "mi", label: "Miles", factor: 1609.344 },
    ],
  },
  weight: {
    name: "Weight",
    units: [
      { key: "mg", label: "Milligrams", factor: 0.000001 },
      { key: "g", label: "Grams", factor: 0.001 },
      { key: "kg", label: "Kilograms", factor: 1 },
      { key: "t", label: "Tonnes", factor: 1000 },
      { key: "oz", label: "Ounces", factor: 0.0283495 },
      { key: "lb", label: "Pounds", factor: 0.453592 },
      { key: "st", label: "Stone", factor: 6.35029 },
    ],
  },
  volume: {
    name: "Volume",
    units: [
      { key: "ml", label: "Milliliters", factor: 0.001 },
      { key: "l", label: "Liters", factor: 1 },
      { key: "gal_us", label: "US Gallons", factor: 3.78541 },
      { key: "gal_uk", label: "UK Gallons", factor: 4.54609 },
      { key: "qt", label: "Quarts", factor: 0.946353 },
      { key: "pt", label: "Pints", factor: 0.473176 },
      { key: "cup", label: "Cups", factor: 0.236588 },
      { key: "fl_oz", label: "Fluid Ounces", factor: 0.0295735 },
    ],
  },
  temperature: {
    name: "Temperature",
    isTemperature: true,
    units: [
      { key: "c", label: "Celsius", factor: 0 },
      { key: "f", label: "Fahrenheit", factor: 0 },
      { key: "k", label: "Kelvin", factor: 0 },
    ],
  },
  speed: {
    name: "Speed",
    units: [
      { key: "ms", label: "m/s", factor: 1 },
      { key: "kmh", label: "km/h", factor: 0.277778 },
      { key: "mph", label: "mph", factor: 0.44704 },
      { key: "kn", label: "Knots", factor: 0.514444 },
      { key: "fts", label: "ft/s", factor: 0.3048 },
    ],
  },
  area: {
    name: "Area",
    units: [
      { key: "sqm", label: "Square Meters", factor: 1 },
      { key: "sqkm", label: "Square Kilometers", factor: 1000000 },
      { key: "sqft", label: "Square Feet", factor: 0.092903 },
      { key: "sqmi", label: "Square Miles", factor: 2589988 },
      { key: "acre", label: "Acres", factor: 4046.86 },
      { key: "ha", label: "Hectares", factor: 10000 },
    ],
  },
  data: {
    name: "Data",
    units: [
      { key: "b", label: "Bytes", factor: 1 },
      { key: "kb", label: "Kilobytes", factor: 1024 },
      { key: "mb", label: "Megabytes", factor: 1048576 },
      { key: "gb", label: "Gigabytes", factor: 1073741824 },
      { key: "tb", label: "Terabytes", factor: 1099511627776 },
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
          {Object.entries(unitCategories).map(([key, cat]) => (
            <TabsTrigger key={key} value={key} className="text-xs px-2.5 h-6">
              {cat.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
        {/* From */}
        <div className="space-y-2">
          <Label className="text-sm">From</Label>
          <Select value={fromUnit} onValueChange={(v) => v && setFromUnit(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {units.map((u) => (
                <SelectItem key={u.key} value={u.key}>
                  {u.label}
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

        {/* Swap */}
        <Button
          variant="outline"
          size="icon"
          onClick={handleSwap}
          className="self-center"
          aria-label="Swap units"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </Button>

        {/* To */}
        <div className="space-y-2">
          <Label className="text-sm">To</Label>
          <Select value={toUnit} onValueChange={(v) => v && setToUnit(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {units.map((u) => (
                <SelectItem key={u.key} value={u.key}>
                  {u.label}
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
