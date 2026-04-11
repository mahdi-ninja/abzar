"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function ipToNum(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  let num = 0;
  for (const p of parts) {
    const n = parseInt(p, 10);
    if (isNaN(n) || n < 0 || n > 255) return null;
    num = (num << 8) | n;
  }
  return num >>> 0;
}

function numToIp(num: number): string {
  return [
    (num >>> 24) & 255,
    (num >>> 16) & 255,
    (num >>> 8) & 255,
    num & 255,
  ].join(".");
}

function cidrToMask(cidr: number): number {
  if (cidr === 0) return 0;
  return (~0 << (32 - cidr)) >>> 0;
}

export default function SubnetCalculator() {
  const [ip, setIp] = useState("192.168.1.0");
  const [cidr, setCidr] = useState("24");

  const result = useMemo(() => {
    const ipNum = ipToNum(ip);
    const cidrNum = parseInt(cidr, 10);
    if (ipNum === null || isNaN(cidrNum) || cidrNum < 0 || cidrNum > 32)
      return null;

    const mask = cidrToMask(cidrNum);
    const network = (ipNum & mask) >>> 0;
    const broadcast = (network | ~mask) >>> 0;
    const firstHost = cidrNum >= 31 ? network : (network + 1) >>> 0;
    const lastHost = cidrNum >= 31 ? broadcast : (broadcast - 1) >>> 0;
    const totalHosts = cidrNum >= 31 ? Math.pow(2, 32 - cidrNum) : Math.pow(2, 32 - cidrNum) - 2;
    const wildcard = (~mask) >>> 0;

    return {
      network: numToIp(network),
      broadcast: numToIp(broadcast),
      mask: numToIp(mask),
      wildcard: numToIp(wildcard),
      firstHost: numToIp(firstHost),
      lastHost: numToIp(lastHost),
      totalHosts: Math.max(0, totalHosts),
      cidr: cidrNum,
    };
  }, [ip, cidr]);

  const rows = result
    ? [
        { label: "Network Address", value: result.network },
        { label: "Broadcast Address", value: result.broadcast },
        { label: "Subnet Mask", value: result.mask },
        { label: "Wildcard Mask", value: result.wildcard },
        { label: "First Usable Host", value: result.firstHost },
        { label: "Last Usable Host", value: result.lastHost },
        { label: "Total Usable Hosts", value: result.totalHosts.toLocaleString() },
        { label: "CIDR Notation", value: `${result.network}/${result.cidr}` },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[180px]">
          <Label className="text-sm mb-1 block">IP Address</Label>
          <Input
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            placeholder="192.168.1.0"
            className="font-mono"
          />
        </div>
        <div className="w-28">
          <Label className="text-sm mb-1 block">CIDR</Label>
          <Select value={cidr} onValueChange={(v) => v && setCidr(v)}>
            <SelectTrigger className="font-mono">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 33 }, (_, i) => (
                <SelectItem key={i} value={String(i)} className="font-mono">
                  /{i}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button size="sm" variant="outline" onClick={() => { setIp("192.168.1.0"); setCidr("24"); }}>Reset</Button>
      </div>

      {!result && ip.trim() && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          Invalid IP address or CIDR.
        </div>
      )}

      {result && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {rows.map(({ label, value }) => (
            <Card key={label} className="p-3">
              <div className="text-xs text-muted-foreground mb-1">{label}</div>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm font-mono">{value}</code>
                <CopyButton value={String(value)} label="" className="shrink-0 h-7" />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
