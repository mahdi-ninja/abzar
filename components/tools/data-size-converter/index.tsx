"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";

const BINARY_UNITS = [["B",1],["KiB",1024],["MiB",1048576],["GiB",1073741824],["TiB",1099511627776],["PiB",1125899906842624]] as const;
const DECIMAL_UNITS = [["B",1],["KB",1000],["MB",1e6],["GB",1e9],["TB",1e12],["PB",1e15]] as const;

export default function DataSizeConverter() {
  const t = useTranslations("dataSizeConverter");
  const [value, setValue] = useState("1");
  const [unit, setUnit] = useState("GB");
  const [binary, setBinary] = useState(true);

  const units = binary ? BINARY_UNITS : DECIMAL_UNITS;
  const inputFactor = units.find(([u]) => u === unit)?.[1] ?? 1;

  const results = useMemo(() => {
    const n = parseFloat(value);
    if (isNaN(n)) return [];
    const bytes = n * inputFactor;
    return units.map(([u, f]) => ({ unit: u, value: (bytes / f).toFixed(f === 1 ? 0 : 6).replace(/\.?0+$/, "") }));
  }, [value, inputFactor, units]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <Label className="text-sm mb-1 block">{t("valueLabel")}</Label>
          <Input type="number" value={value} onChange={(e) => setValue(e.target.value)} className="w-36" />
        </div>
        <div>
          <Label className="text-sm mb-1 block">{t("unitLabel")}</Label>
          <div className="flex gap-1 flex-wrap">
            {units.map(([u]) => (
              <button key={u} onClick={() => setUnit(u)} className={`h-8 px-2.5 rounded border text-xs font-mono ${unit === u ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"}`}>{u}</button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Switch checked={binary} onCheckedChange={setBinary} />
          <Label className="text-xs">{binary ? t("binaryLabel") : t("decimalLabel")}</Label>
        </div>
        <Button size="sm" variant="outline" onClick={() => { setValue("1"); setUnit("GB"); setBinary(true); }}>{t("reset")}</Button>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {results.map(({ unit: u, value: v }) => (
          <Card key={u} className="p-3">
            <div className="text-xs text-muted-foreground mb-1">{u}</div>
            <div className="flex items-center gap-2">
              <code className="flex-1 font-mono text-sm">{v}</code>
              <CopyButton value={v} label="" className="shrink-0 h-7" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
