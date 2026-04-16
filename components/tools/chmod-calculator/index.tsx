"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";

const PERMS = ["r", "w", "x"] as const;

export default function ChmodCalculator() {
  const t = useTranslations("chmodCalculator");
  const [bits, setBits] = useState([true, true, false, true, false, false, true, false, false]);

  const octal = useMemo(() => {
    let o = "";
    for (let g = 0; g < 3; g++) {
      let v = 0;
      if (bits[g * 3]) v += 4;
      if (bits[g * 3 + 1]) v += 2;
      if (bits[g * 3 + 2]) v += 1;
      o += v;
    }
    return o;
  }, [bits]);

  const symbolic = useMemo(() => {
    let s = "";
    for (let g = 0; g < 3; g++) {
      for (let p = 0; p < 3; p++) {
        s += bits[g * 3 + p] ? PERMS[p] : "-";
      }
    }
    return s;
  }, [bits]);

  const toggle = (idx: number) => {
    setBits((prev) => { const next = [...prev]; next[idx] = !next[idx]; return next; });
  };

  const setFromOctal = (val: string) => {
    const digits = val.replace(/[^0-7]/g, "").slice(0, 3).padStart(3, "0");
    const newBits = [];
    for (const d of digits) {
      const n = parseInt(d, 8);
      newBits.push((n & 4) !== 0, (n & 2) !== 0, (n & 1) !== 0);
    }
    setBits(newBits);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button size="sm" variant="outline" onClick={() => setBits([true, true, false, true, false, false, true, false, false])}>{t("reset")}</Button>
      </div>
      <div className="overflow-auto">
        <table className="text-sm">
          <thead>
            <tr>
              <th className="px-4 py-2 text-start font-medium" />
              {PERMS.map((p) => <th key={p} className="px-4 py-2 text-center font-medium">{p === "r" ? t("read") : p === "w" ? t("write") : t("execute")}</th>)}
            </tr>
          </thead>
          <tbody>
            {(["owner", "group", "other"] as const).map((group, g) => (
              <tr key={group}>
                <td className="px-4 py-2 font-medium">{t(group)}</td>
                {PERMS.map((_, p) => {
                  const idx = g * 3 + p;
                  return (
                    <td key={p} className="px-4 py-2 text-center">
                      <input type="checkbox" checked={bits[idx]} onChange={() => toggle(idx)} className="h-5 w-5 cursor-pointer accent-primary" />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <Label className="text-xs mb-1 block">{t("octalLabel")}</Label>
          <div className="flex gap-2">
            <Input value={octal} onChange={(e) => setFromOctal(e.target.value)} className="font-mono text-lg text-center" maxLength={3} />
            <CopyButton value={octal} label="" />
          </div>
        </div>
        <div>
          <Label className="text-xs mb-1 block">{t("symbolicLabel")}</Label>
          <div className="flex gap-2">
            <Input value={symbolic} readOnly className="font-mono text-lg text-center" />
            <CopyButton value={symbolic} label="" />
          </div>
        </div>
        <div>
          <Label className="text-xs mb-1 block">{t("commandLabel")}</Label>
          <div className="flex gap-2">
            <Input value={`chmod ${octal}`} readOnly className="font-mono text-lg" />
            <CopyButton value={`chmod ${octal}`} label="" />
          </div>
        </div>
      </div>
    </div>
  );
}
