"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Algorithm = "bubble" | "selection" | "insertion" | "quick" | "merge";

interface BarState {
  value: number;
  state: "default" | "comparing" | "swapping" | "sorted";
}

function randomArray(size: number): number[] {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 100) + 5);
}

export default function AlgorithmVisualizer() {
  const [size, setSize] = useState(30);
  const [algo, setAlgo] = useState<Algorithm>("bubble");
  const [bars, setBars] = useState<BarState[]>(() =>
    randomArray(30).map((v) => ({ value: v, state: "default" }))
  );
  const [sorting, setSorting] = useState(false);
  const [speed, setSpeed] = useState(50);
  const stopRef = useRef(false);
  const speedRef = useRef(speed);
  useEffect(() => { speedRef.current = speed; }, [speed]);

  const generateNew = useCallback(() => {
    stopRef.current = true;
    setSorting(false);
    const arr = randomArray(size);
    setBars(arr.map((v) => ({ value: v, state: "default" })));
  }, [size]);

  const delay = useCallback(
    () => new Promise<void>((resolve) => setTimeout(resolve, speedRef.current)),
    []
  );

  const sortArray = useCallback(async () => {
    stopRef.current = false;
    setSorting(true);
    const arr = bars.map((b) => b.value);
    const n = arr.length;

    const update = (highlights: Record<number, BarState["state"]> = {}) => {
      if (stopRef.current) throw new Error("stopped");
      setBars(
        arr.map((v, i) => ({
          value: v,
          state: highlights[i] || "default",
        }))
      );
    };

    try {
      if (algo === "bubble") {
        for (let i = 0; i < n - 1; i++) {
          for (let j = 0; j < n - i - 1; j++) {
            update({ [j]: "comparing", [j + 1]: "comparing" });
            await delay();
            if (arr[j] > arr[j + 1]) {
              [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
              update({ [j]: "swapping", [j + 1]: "swapping" });
              await delay();
            }
          }
        }
      } else if (algo === "selection") {
        for (let i = 0; i < n; i++) {
          let minIdx = i;
          for (let j = i + 1; j < n; j++) {
            update({ [minIdx]: "comparing", [j]: "comparing" });
            await delay();
            if (arr[j] < arr[minIdx]) minIdx = j;
          }
          [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
          update({ [i]: "swapping", [minIdx]: "swapping" });
          await delay();
        }
      } else if (algo === "insertion") {
        for (let i = 1; i < n; i++) {
          const key = arr[i];
          let j = i - 1;
          update({ [i]: "comparing" });
          await delay();
          while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            update({ [j]: "swapping", [j + 1]: "swapping" });
            await delay();
            j--;
          }
          arr[j + 1] = key;
        }
      } else if (algo === "quick") {
        const quickSort = async (lo: number, hi: number) => {
          if (lo >= hi) return;
          const pivot = arr[hi];
          let i = lo;
          for (let j = lo; j < hi; j++) {
            update({ [j]: "comparing", [hi]: "comparing" });
            await delay();
            if (arr[j] < pivot) {
              [arr[i], arr[j]] = [arr[j], arr[i]];
              update({ [i]: "swapping", [j]: "swapping" });
              await delay();
              i++;
            }
          }
          [arr[i], arr[hi]] = [arr[hi], arr[i]];
          update({ [i]: "swapping", [hi]: "swapping" });
          await delay();
          await quickSort(lo, i - 1);
          await quickSort(i + 1, hi);
        };
        await quickSort(0, n - 1);
      } else if (algo === "merge") {
        const mergeSort = async (lo: number, hi: number) => {
          if (lo >= hi) return;
          const mid = Math.floor((lo + hi) / 2);
          await mergeSort(lo, mid);
          await mergeSort(mid + 1, hi);
          const left = arr.slice(lo, mid + 1);
          const right = arr.slice(mid + 1, hi + 1);
          let i = 0, j = 0, k = lo;
          while (i < left.length && j < right.length) {
            update({ [k]: "comparing" });
            await delay();
            if (left[i] <= right[j]) { arr[k] = left[i]; i++; }
            else { arr[k] = right[j]; j++; }
            update({ [k]: "swapping" });
            await delay();
            k++;
          }
          while (i < left.length) { arr[k] = left[i]; i++; k++; update({ [k - 1]: "swapping" }); await delay(); }
          while (j < right.length) { arr[k] = right[j]; j++; k++; update({ [k - 1]: "swapping" }); await delay(); }
        };
        await mergeSort(0, n - 1);
      }

      // Mark all sorted
      setBars(arr.map((v) => ({ value: v, state: "sorted" })));
    } catch {
      // stopped
    }
    setSorting(false);
  }, [bars, algo, delay]);

  const maxValue = Math.max(...bars.map((b) => b.value), 1);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <Label className="text-xs mb-1 block">Algorithm</Label>
          <Select value={algo} onValueChange={(v) => v && setAlgo(v as Algorithm)}>
            <SelectTrigger className="w-32 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bubble">Bubble Sort</SelectItem>
              <SelectItem value="selection">Selection Sort</SelectItem>
              <SelectItem value="insertion">Insertion Sort</SelectItem>
              <SelectItem value="quick">Quick Sort</SelectItem>
              <SelectItem value="merge">Merge Sort</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-32">
          <Label className="text-xs mb-1 block">Size: {size}</Label>
          <Slider
            value={[size]}
            onValueChange={(v) => { const s = Array.isArray(v) ? v[0] : v; setSize(s); }}
            min={10}
            max={80}
            step={5}
            disabled={sorting}
          />
        </div>
        <div className="w-32">
          <Label className="text-xs mb-1 block">Speed: {speed}ms</Label>
          <Slider
            value={[speed]}
            onValueChange={(v) => setSpeed(Array.isArray(v) ? v[0] : v)}
            min={5}
            max={200}
            step={5}
          />
        </div>
        <Button size="sm" onClick={sortArray} disabled={sorting}>
          Sort
        </Button>
        <Button size="sm" variant="outline" onClick={generateNew}>
          New Array
        </Button>
      </div>

      {/* Bar chart */}
      <div className="flex items-end gap-px h-64 border rounded-md p-2 bg-muted/30">
        {bars.map((bar, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-sm transition-all duration-75"
            style={{
              height: `${(bar.value / maxValue) * 100}%`,
              backgroundColor:
                bar.state === "sorted"
                  ? "#10b981"
                  : bar.state === "comparing"
                  ? "#f59e0b"
                  : bar.state === "swapping"
                  ? "#ef4444"
                  : "var(--primary)",
              minWidth: 2,
            }}
          />
        ))}
      </div>

      <div className="flex gap-4 text-xs text-muted-foreground">
        <span><span className="inline-block h-2 w-2 rounded-full bg-primary mr-1" />Default</span>
        <span><span className="inline-block h-2 w-2 rounded-full bg-amber-500 mr-1" />Comparing</span>
        <span><span className="inline-block h-2 w-2 rounded-full bg-destructive mr-1" />Swapping</span>
        <span><span className="inline-block h-2 w-2 rounded-full bg-emerald-500 mr-1" />Sorted</span>
      </div>
    </div>
  );
}
