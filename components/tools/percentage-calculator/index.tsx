"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PercentageCalculator() {
  const t = useTranslations("percentageCalculator");
  const [mode, setMode] = useState("of");
  const [a, setA] = useState("");
  const [b, setB] = useState("");

  const result = useMemo(() => {
    const na = parseFloat(a), nb = parseFloat(b);
    if (isNaN(na) || isNaN(nb)) return "";
    if (mode === "of") return ((na / 100) * nb).toFixed(4).replace(/\.?0+$/, "");
    if (mode === "is") return nb === 0 ? "∞" : ((na / nb) * 100).toFixed(2).replace(/\.?0+$/, "") + "%";
    if (mode === "change") return na === 0 ? "∞" : (((nb - na) / na) * 100).toFixed(2).replace(/\.?0+$/, "") + "%";
    return "";
  }, [a, b, mode]);

  return (
    <div className="space-y-6">
      <Tabs value={mode} onValueChange={setMode}>
        <TabsList className="h-8">
          <TabsTrigger value="of" className="text-xs px-3 h-6">{t("tabOf")}</TabsTrigger>
          <TabsTrigger value="is" className="text-xs px-3 h-6">{t("tabIs")}</TabsTrigger>
          <TabsTrigger value="change" className="text-xs px-3 h-6">{t("tabChange")}</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <Label className="text-xs mb-1 block">{mode === "of" ? t("labelPercentage") : mode === "is" ? t("labelValue") : t("labelFrom")}</Label>
          <Input type="number" value={a} onChange={(e) => setA(e.target.value)} className="w-36" />
        </div>
        <span className="text-muted-foreground pb-2">{mode === "of" ? t("separatorOf") : mode === "is" ? t("separatorIs") : t("separatorArrow")}</span>
        <div>
          <Label className="text-xs mb-1 block">{mode === "of" ? t("labelNumber") : mode === "is" ? t("labelTotal") : t("labelTo")}</Label>
          <Input type="number" value={b} onChange={(e) => setB(e.target.value)} className="w-36" />
        </div>
        <span className="text-muted-foreground pb-2">=</span>
        <Card className="px-4 py-2">
          <span className="text-lg font-bold tabular-nums">{result || "—"}</span>
        </Card>
        <Button size="sm" variant="outline" onClick={() => { setA(""); setB(""); setMode("of"); }}>{t("clear")}</Button>
      </div>
    </div>
  );
}
