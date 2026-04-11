"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/ui/copy-button";
import { Card } from "@/components/ui/card";

const CHARSETS = {
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lower: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};

function generatePassword(
  length: number,
  options: { upper: boolean; lower: boolean; numbers: boolean; symbols: boolean }
): string {
  let chars = "";
  if (options.upper) chars += CHARSETS.upper;
  if (options.lower) chars += CHARSETS.lower;
  if (options.numbers) chars += CHARSETS.numbers;
  if (options.symbols) chars += CHARSETS.symbols;
  if (!chars) chars = CHARSETS.lower;

  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (v) => chars[v % chars.length]).join("");
}

function calculateEntropy(
  length: number,
  options: { upper: boolean; lower: boolean; numbers: boolean; symbols: boolean }
): number {
  let poolSize = 0;
  if (options.upper) poolSize += 26;
  if (options.lower) poolSize += 26;
  if (options.numbers) poolSize += 10;
  if (options.symbols) poolSize += CHARSETS.symbols.length;
  if (poolSize === 0) poolSize = 26;
  return Math.round(length * Math.log2(poolSize));
}

function getStrengthLabel(entropy: number): { label: string; color: string } {
  if (entropy < 40) return { label: "Weak", color: "text-destructive" };
  if (entropy < 60) return { label: "Fair", color: "text-amber-500" };
  if (entropy < 80) return { label: "Strong", color: "text-emerald-500" };
  return { label: "Very Strong", color: "text-emerald-600" };
}

export default function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    upper: true,
    lower: true,
    numbers: true,
    symbols: true,
  });
  const [password, setPassword] = useState(() =>
    generatePassword(16, { upper: true, lower: true, numbers: true, symbols: true })
  );
  const [quantity, setQuantity] = useState(1);
  const [bulk, setBulk] = useState<string[]>([]);

  const regenerate = useCallback(() => {
    if (quantity === 1) {
      setPassword(generatePassword(length, options));
      setBulk([]);
    } else {
      const passwords = Array.from({ length: quantity }, () =>
        generatePassword(length, options)
      );
      setBulk(passwords);
      setPassword(passwords[0]);
    }
  }, [length, options, quantity]);

  // Auto-regenerate when parameters change
  useEffect(() => {
    regenerate();
  }, [regenerate]);

  const entropy = calculateEntropy(length, options);
  const strength = getStrengthLabel(entropy);

  return (
    <div className="space-y-6">
      {/* Password display */}
      <div className="flex items-center gap-2">
        <Input
          value={password}
          readOnly
          className="font-mono text-base tracking-wide"
        />
        <CopyButton value={password} />
        <Button size="sm" onClick={regenerate}>
          Generate
        </Button>
      </div>

      {/* Strength indicator */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(100, (entropy / 128) * 100)}%`,
                backgroundColor:
                  entropy < 40
                    ? "var(--destructive)"
                    : entropy < 60
                    ? "#f59e0b"
                    : "#10b981",
              }}
            />
          </div>
        </div>
        <span className={`text-sm font-medium ${strength.color}`}>
          {strength.label}
        </span>
        <span className="text-xs text-muted-foreground">{entropy} bits</span>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-4">
          <div>
            <Label className="text-sm mb-2 block">
              Length: {length}
            </Label>
            <Slider
              value={[length]}
              onValueChange={(v) => setLength(Array.isArray(v) ? v[0] : v)}
              min={4}
              max={128}
              step={1}
            />
          </div>

          <div>
            <Label className="text-sm mb-2 block">Quantity</Label>
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
        </div>

        <div className="space-y-3">
          {(
            [
              ["upper", "Uppercase (A-Z)"],
              ["lower", "Lowercase (a-z)"],
              ["numbers", "Numbers (0-9)"],
              ["symbols", "Symbols (!@#$...)"],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="flex items-center gap-2">
              <Switch
                checked={options[key]}
                onCheckedChange={(checked) =>
                  setOptions((prev) => ({ ...prev, [key]: checked }))
                }
              />
              <Label className="text-sm">{label}</Label>
            </div>
          ))}
        </div>
      </div>

      {/* Bulk output */}
      {bulk.length > 1 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-medium">
              Generated {bulk.length} passwords
            </Label>
            <CopyButton value={bulk.join("\n")} label="Copy All" />
          </div>
          <div className="max-h-48 overflow-auto rounded bg-muted p-2 font-mono text-xs space-y-0.5">
            {bulk.map((pw, i) => (
              <div key={i}>{pw}</div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
