"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileDropZone } from "@/components/ui/file-drop-zone";
import { Label } from "@/components/ui/label";

const ALGORITHMS = [
  { key: "SHA-1", label: "SHA-1" },
  { key: "SHA-256", label: "SHA-256" },
  { key: "SHA-512", label: "SHA-512" },
] as const;

async function computeHash(
  algorithm: string,
  data: ArrayBuffer
): Promise<string> {
  const hash = await crypto.subtle.digest(algorithm, data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// MD5 implementation (Web Crypto doesn't support MD5)
function md5(data: ArrayBuffer): string {
  const bytes = new Uint8Array(data);

  // Helper functions
  const add = (a: number, b: number) => (a + b) >>> 0;
  const rot = (v: number, s: number) => ((v << s) | (v >>> (32 - s))) >>> 0;

  const F = (b: number, c: number, d: number) => (b & c) | (~b & d);
  const G = (b: number, c: number, d: number) => (b & d) | (c & ~d);
  const H = (b: number, c: number, d: number) => b ^ c ^ d;
  const I = (b: number, c: number, d: number) => c ^ (b | ~d);

  const T = Array.from({ length: 64 }, (_, i) =>
    (Math.floor(Math.abs(Math.sin(i + 1)) * 0x100000000)) >>> 0
  );

  // Pre-processing: pad message to 64-byte blocks
  const bitLen = bytes.length * 8;
  const padLen = bytes.length % 64 < 56 ? 56 - (bytes.length % 64) : 120 - (bytes.length % 64);
  const padded = new Uint8Array(bytes.length + padLen + 8);
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  // Append length in bits as 64-bit LE
  for (let i = 0; i < 4; i++) padded[padded.length - 8 + i] = (bitLen >>> (i * 8)) & 0xff;

  // Process each 64-byte block
  let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;

  for (let offset = 0; offset < padded.length; offset += 64) {
    const M: number[] = [];
    for (let j = 0; j < 16; j++) {
      const o = offset + j * 4;
      M[j] = padded[o] | (padded[o + 1] << 8) | (padded[o + 2] << 16) | (padded[o + 3] << 24);
    }

    let a = a0, b = b0, c = c0, d = d0;
    const S = [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21];
    const gIdx = [
      0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,   // Round 1
      1,6,11,0,5,10,15,4,9,14,3,8,13,2,7,12,    // Round 2
      5,8,11,14,1,4,7,10,13,0,3,6,9,12,15,2,    // Round 3
      0,7,14,5,12,3,10,1,8,15,6,13,4,11,2,9,    // Round 4
    ];
    const funcs = [F, G, H, I];

    for (let i = 0; i < 64; i++) {
      const round = i >> 4;
      const fn = funcs[round];
      const f = fn(b, c, d) >>> 0;
      const temp = add(add(add(a, f), (M[gIdx[i]] >>> 0)), T[i]);
      a = d;
      d = c;
      c = b;
      b = add(b, rot(temp, S[round * 4 + (i % 4)]));
    }

    a0 = add(a0, a); b0 = add(b0, b); c0 = add(c0, c); d0 = add(d0, d);
  }

  const toHex = (n: number) =>
    [0, 8, 16, 24].map((s) => ((n >>> s) & 0xff).toString(16).padStart(2, "0")).join("");
  return toHex(a0) + toHex(b0) + toHex(c0) + toHex(d0);
}

export default function HashGenerator() {
  const t = useTranslations("hashGenerator");
  const [mode, setMode] = useState<"text" | "file">("text");
  const [input, setInput] = useState("");
  const [hashes, setHashes] = useState<Record<string, string>>({});
  const [computing, setComputing] = useState(false);
  const [fileName, setFileName] = useState("");

  const computeAll = useCallback(async (data: ArrayBuffer) => {
    setComputing(true);
    try {
      const results: Record<string, string> = {};
      for (const algo of ALGORITHMS) {
        results[algo.key] = await computeHash(algo.key, data);
      }
      results["MD5"] = md5(data);
      setHashes(results);
    } finally {
      setComputing(false);
    }
  }, []);

  const handleTextChange = useCallback(
    (text: string) => {
      setInput(text);
      if (text) {
        const encoder = new TextEncoder();
        computeAll(encoder.encode(text).buffer as ArrayBuffer);
      } else {
        setHashes({});
      }
    },
    [computeAll]
  );

  const handleFileUpload = useCallback(
    (files: File[]) => {
      const file = files[0];
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        computeAll(reader.result as ArrayBuffer);
      };
      reader.readAsArrayBuffer(file);
    },
    [computeAll]
  );

  const handleClear = useCallback(() => {
    setInput("");
    setHashes({});
    setFileName("");
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Tabs value={mode} onValueChange={(v) => { setMode(v as "text" | "file"); handleClear(); }}>
          <TabsList className="h-8">
            <TabsTrigger value="text" className="text-xs px-3 h-6">
              {t("text")}
            </TabsTrigger>
            <TabsTrigger value="file" className="text-xs px-3 h-6">
              {t("file")}
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <Button size="sm" variant="outline" onClick={handleClear}>
          {t("clear")}
        </Button>
      </div>

      {mode === "text" ? (
        <Textarea
          value={input}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder={t("inputPlaceholder")}
          className="min-h-30 font-mono text-sm"
        />
      ) : (
        <FileDropZone
          onFiles={handleFileUpload}
          label={fileName ? t("selectedFile", { fileName }) : t("dropFileLabel")}
          className="min-h-30"
        />
      )}

      {computing && (
        <p className="text-sm text-muted-foreground">{t("computing")}</p>
      )}

      {Object.keys(hashes).length > 0 && (
        <div className="space-y-3">
          {["MD5", ...ALGORITHMS.map((a) => a.key)].map((algo) => (
            <Card key={algo} className="p-3">
              <div className="flex items-center justify-between mb-1">
                <Label className="text-xs font-medium">{algo}</Label>
                <CopyButton value={hashes[algo] ?? ""} label="" className="h-7" />
              </div>
              <code className="block text-xs font-mono text-muted-foreground break-all">
                {hashes[algo]}
              </code>
            </Card>
          ))}
        </div>
      )}

      {!Object.keys(hashes).length && !computing && (
        <div className="text-center text-sm text-muted-foreground py-8">
          {t("emptyHint")}
        </div>
      )}
    </div>
  );
}
