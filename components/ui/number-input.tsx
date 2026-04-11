"use client";

import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  disabled?: boolean;
}

export function NumberInput({
  value,
  onChange,
  min = -Infinity,
  max = Infinity,
  step = 1,
  className,
  disabled,
}: NumberInputProps) {
  const clamp = useCallback(
    (n: number) => Math.max(min, Math.min(max, n)),
    [min, max]
  );

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      <Button
        size="sm"
        variant="outline"
        className="h-8 w-8 p-0 shrink-0"
        onClick={() => onChange(clamp(value - step))}
        disabled={disabled || value <= min}
        aria-label="Decrease"
      >
        -
      </Button>
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(clamp(Number(e.target.value)))}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className="h-8 text-center text-sm [&::-webkit-inner-spin-button]:appearance-none"
      />
      <Button
        size="sm"
        variant="outline"
        className="h-8 w-8 p-0 shrink-0"
        onClick={() => onChange(clamp(value + step))}
        disabled={disabled || value >= max}
        aria-label="Increase"
      >
        +
      </Button>
    </div>
  );
}
