"use client";

import { useState, useMemo } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { InputOutputLayout } from "@/components/ui/input-output-layout";

const FLIP_MAP: Record<string, string> = { a: "ɐ", b: "q", c: "ɔ", d: "p", e: "ǝ", f: "ɟ", g: "ƃ", h: "ɥ", i: "ᴉ", j: "ɾ", k: "ʞ", l: "l", m: "ɯ", n: "u", o: "o", p: "d", q: "b", r: "ɹ", s: "s", t: "ʇ", u: "n", v: "ʌ", w: "ʍ", x: "x", y: "ʎ", z: "z", A: "∀", B: "q", C: "Ɔ", D: "p", E: "Ǝ", F: "Ⅎ", G: "פ", H: "H", I: "I", J: "ɾ", K: "ʞ", L: "˥", M: "W", N: "N", O: "O", P: "Ԁ", Q: "Q", R: "ɹ", S: "S", T: "┴", U: "∩", V: "Λ", W: "M", X: "X", Y: "⅄", Z: "Z", "1": "Ɩ", "2": "ᄅ", "3": "Ɛ", "4": "ㄣ", "5": "ϛ", "6": "9", "7": "Ɫ", "8": "8", "9": "6", "0": "0", ".": "˙", ",": "'", "'": ",", "!": "¡", "?": "¿", "(": ")", ")": "(", "[": "]", "]": "[", "{": "}", "}": "{", "<": ">", ">": "<" };

function flipUpsideDown(s: string): string {
  return [...s].map((c) => FLIP_MAP[c] || c).reverse().join("");
}

export default function ReverseText() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"chars" | "words" | "lines" | "flip">("chars");

  const output = useMemo(() => {
    if (!input) return "";
    switch (mode) {
      case "chars": return [...input].reverse().join("");
      case "words": return input.split(/(\s+)/).reverse().join("");
      case "lines": return input.split("\n").reverse().join("\n");
      case "flip": return flipUpsideDown(input);
    }
  }, [input, mode]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(["chars", "words", "lines", "flip"] as const).map((m) => (
          <Button key={m} size="sm" variant={mode === m ? "default" : "secondary"} onClick={() => setMode(m)} className="capitalize">
            {m === "chars" ? "Reverse Characters" : m === "words" ? "Reverse Words" : m === "lines" ? "Reverse Lines" : "Flip Upside Down"}
          </Button>
        ))}
        <Button size="sm" variant="outline" onClick={() => { setInput(""); setMode("chars"); }}>Clear</Button>
      </div>
      <InputOutputLayout
        inputLabel="Input"
        outputLabel="Output"
        input={
          <Textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type text here..." className="min-h-50 text-sm" />
        }
        output={
          <>
            {output && <div className="flex justify-end"><CopyButton value={output} /></div>}
            <Textarea value={output} readOnly className="min-h-50 text-sm" />
          </>
        }
      />
    </div>
  );
}
