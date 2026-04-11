"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CopyButton } from "@/components/ui/copy-button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

function generateUUIDv4(): string {
  return crypto.randomUUID();
}

function generateULID(): string {
  const ENCODING = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
  const now = Date.now();
  let timeStr = "";
  let t = now;
  for (let i = 0; i < 10; i++) {
    timeStr = ENCODING[t % 32] + timeStr;
    t = Math.floor(t / 32);
  }
  const random = new Uint8Array(16);
  crypto.getRandomValues(random);
  let randomStr = "";
  for (let i = 0; i < 16; i++) {
    randomStr += ENCODING[random[i] % 32];
  }
  return timeStr + randomStr;
}

function generateUUIDv7(): string {
  const now = Date.now();
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);

  // 48-bit timestamp (ms since epoch) in bytes 0-5
  bytes[0] = (now / 2 ** 40) & 0xff;
  bytes[1] = (now / 2 ** 32) & 0xff;
  bytes[2] = (now / 2 ** 24) & 0xff;
  bytes[3] = (now / 2 ** 16) & 0xff;
  bytes[4] = (now / 2 ** 8) & 0xff;
  bytes[5] = now & 0xff;

  // Version 7 — set bits 6-7 of byte 6 to 0b0111
  bytes[6] = (bytes[6] & 0x0f) | 0x70;
  // Variant 10xx — set bits 6-7 of byte 8 to 0b10
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function generateNanoid(size = 21): string {
  const alphabet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-";
  const bytes = new Uint8Array(size);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => alphabet[b & 63]).join("");
}

type IdType = "uuidv4" | "uuidv7" | "ulid" | "nanoid";

const generators: Record<IdType, () => string> = {
  uuidv4: generateUUIDv4,
  uuidv7: generateUUIDv7,
  ulid: generateULID,
  nanoid: generateNanoid,
};

export default function UuidGenerator() {
  const [type, setType] = useState<IdType>("uuidv4");
  const [quantity, setQuantity] = useState(1);
  const [ids, setIds] = useState<string[]>(() => [generateUUIDv4()]);

  const handleGenerate = useCallback(() => {
    const gen = generators[type];
    setIds(Array.from({ length: quantity }, () => gen()));
  }, [type, quantity]);

  const handleTypeChange = useCallback((value: string) => {
    const t = value as IdType;
    setType(t);
    setIds([generators[t]()]);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <Label className="text-sm mb-1 block">Type</Label>
          <Tabs value={type} onValueChange={handleTypeChange}>
            <TabsList className="h-8">
              <TabsTrigger value="uuidv4" className="text-xs px-3 h-6">
                UUID v4
              </TabsTrigger>
              <TabsTrigger value="uuidv7" className="text-xs px-3 h-6">
                UUID v7
              </TabsTrigger>
              <TabsTrigger value="ulid" className="text-xs px-3 h-6">
                ULID
              </TabsTrigger>
              <TabsTrigger value="nanoid" className="text-xs px-3 h-6">
                nanoid
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div>
          <Label className="text-sm mb-1 block">Quantity</Label>
          <Input
            type="number"
            min={1}
            max={100}
            value={quantity}
            onChange={(e) =>
              setQuantity(Math.max(1, Math.min(100, Number(e.target.value))))
            }
            className="w-24"
          />
        </div>

        <Button size="sm" onClick={handleGenerate}>
          Generate
        </Button>
      </div>

      {ids.length === 1 ? (
        <div className="flex items-center gap-2">
          <Input
            value={ids[0]}
            readOnly
            className="font-mono text-sm"
          />
          <CopyButton value={ids[0]} />
        </div>
      ) : (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-medium">
              Generated {ids.length} IDs
            </Label>
            <CopyButton value={ids.join("\n")} label="Copy All" />
          </div>
          <div className="max-h-64 overflow-auto rounded bg-muted p-2 font-mono text-xs space-y-0.5">
            {ids.map((id, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="flex-1 select-all">{id}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="text-xs text-muted-foreground">
        {type === "uuidv4" && "UUID v4: 128-bit random identifier (RFC 9562). Uses crypto.randomUUID()."}
        {type === "uuidv7" && "UUID v7: Time-ordered UUID (RFC 9562). 48-bit Unix timestamp (ms) + random. Sortable by creation time."}
        {type === "ulid" && "ULID: Universally Unique Lexicographically Sortable Identifier. 48-bit timestamp + 80-bit random."}
        {type === "nanoid" && "nanoid: Compact URL-friendly unique ID. 21 characters, ~126 bits of entropy."}
      </div>
    </div>
  );
}
