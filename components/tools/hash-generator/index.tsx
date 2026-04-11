"use client";

import { useState, useCallback } from "react";
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

// Simple MD5 implementation (Web Crypto doesn't support MD5)
function md5(data: ArrayBuffer): string {
  const bytes = new Uint8Array(data);
  let s = "";
  for (let i = 0; i < bytes.length; i++) {
    s += String.fromCharCode(bytes[i]);
  }
  return md5Hash(s);
}

function md5Hash(string: string): string {
  function rotateLeft(val: number, bits: number) {
    return (val << bits) | (val >>> (32 - bits));
  }

  function addUnsigned(x: number, y: number) {
    return ((x & 0x7fffffff) + (y & 0x7fffffff)) ^ (x & 0x80000000) ^ (y & 0x80000000);
  }

  function f(x: number, y: number, z: number) { return (x & y) | (~x & z); }
  function g(x: number, y: number, z: number) { return (x & z) | (y & ~z); }
  function h(x: number, y: number, z: number) { return x ^ y ^ z; }
  function ii(x: number, y: number, z: number) { return y ^ (x | ~z); }

  function transform(
    func: (a: number, b: number, c: number) => number,
    a: number, b: number, c: number, d: number,
    x: number, s: number, ac: number
  ) {
    a = addUnsigned(a, addUnsigned(addUnsigned(func(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }

  const words: number[] = [];
  const len = string.length;

  for (let i = 0; i < len; i += 4) {
    words.push(
      (string.charCodeAt(i)) |
      (string.charCodeAt(i + 1) << 8) |
      (string.charCodeAt(i + 2) << 16) |
      (string.charCodeAt(i + 3) << 24)
    );
  }

  // Padding
  const bitLen = len * 8;
  words[len >> 2] |= 0x80 << ((len % 4) * 8);
  words[(((len + 8) >>> 6) << 4) + 14] = bitLen;

  let a = 0x67452301, b2 = 0xefcdab89, c = 0x98badcfe, d = 0x10325476;

  const S = [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21];
  const T = Array.from({ length: 64 }, (_, i) =>
    Math.floor(Math.abs(Math.sin(i + 1)) * 0x100000000)
  );

  for (let i = 0; i < words.length; i += 16) {
    const aa = a, bb = b2, cc = c, dd = d;
    const w = words.slice(i, i + 16);
    // Pad w to 16 elements
    while (w.length < 16) w.push(0);

    // Round 1
    a = transform(f, a, b2, c, d, w[0], S[0], T[0]);
    d = transform(f, d, a, b2, c, w[1], S[1], T[1]);
    c = transform(f, c, d, a, b2, w[2], S[2], T[2]);
    b2 = transform(f, b2, c, d, a, w[3], S[3], T[3]);
    a = transform(f, a, b2, c, d, w[4], S[0], T[4]);
    d = transform(f, d, a, b2, c, w[5], S[1], T[5]);
    c = transform(f, c, d, a, b2, w[6], S[2], T[6]);
    b2 = transform(f, b2, c, d, a, w[7], S[3], T[7]);
    a = transform(f, a, b2, c, d, w[8], S[0], T[8]);
    d = transform(f, d, a, b2, c, w[9], S[1], T[9]);
    c = transform(f, c, d, a, b2, w[10], S[2], T[10]);
    b2 = transform(f, b2, c, d, a, w[11], S[3], T[11]);
    a = transform(f, a, b2, c, d, w[12], S[0], T[12]);
    d = transform(f, d, a, b2, c, w[13], S[1], T[13]);
    c = transform(f, c, d, a, b2, w[14], S[2], T[14]);
    b2 = transform(f, b2, c, d, a, w[15], S[3], T[15]);

    // Round 2
    a = transform(g, a, b2, c, d, w[1], S[4], T[16]);
    d = transform(g, d, a, b2, c, w[6], S[5], T[17]);
    c = transform(g, c, d, a, b2, w[11], S[6], T[18]);
    b2 = transform(g, b2, c, d, a, w[0], S[7], T[19]);
    a = transform(g, a, b2, c, d, w[5], S[4], T[20]);
    d = transform(g, d, a, b2, c, w[10], S[5], T[21]);
    c = transform(g, c, d, a, b2, w[15], S[6], T[22]);
    b2 = transform(g, b2, c, d, a, w[4], S[7], T[23]);
    a = transform(g, a, b2, c, d, w[9], S[4], T[24]);
    d = transform(g, d, a, b2, c, w[14], S[5], T[25]);
    c = transform(g, c, d, a, b2, w[3], S[6], T[26]);
    b2 = transform(g, b2, c, d, a, w[8], S[7], T[27]);
    a = transform(g, a, b2, c, d, w[13], S[4], T[28]);
    d = transform(g, d, a, b2, c, w[2], S[5], T[29]);
    c = transform(g, c, d, a, b2, w[7], S[6], T[30]);
    b2 = transform(g, b2, c, d, a, w[12], S[7], T[31]);

    // Round 3
    a = transform(h, a, b2, c, d, w[5], S[8], T[32]);
    d = transform(h, d, a, b2, c, w[8], S[9], T[33]);
    c = transform(h, c, d, a, b2, w[11], S[10], T[34]);
    b2 = transform(h, b2, c, d, a, w[14], S[11], T[35]);
    a = transform(h, a, b2, c, d, w[1], S[8], T[36]);
    d = transform(h, d, a, b2, c, w[4], S[9], T[37]);
    c = transform(h, c, d, a, b2, w[7], S[10], T[38]);
    b2 = transform(h, b2, c, d, a, w[10], S[11], T[39]);
    a = transform(h, a, b2, c, d, w[13], S[8], T[40]);
    d = transform(h, d, a, b2, c, w[0], S[9], T[41]);
    c = transform(h, c, d, a, b2, w[3], S[10], T[42]);
    b2 = transform(h, b2, c, d, a, w[6], S[11], T[43]);
    a = transform(h, a, b2, c, d, w[9], S[8], T[44]);
    d = transform(h, d, a, b2, c, w[12], S[9], T[45]);
    c = transform(h, c, d, a, b2, w[15], S[10], T[46]);
    b2 = transform(h, b2, c, d, a, w[2], S[11], T[47]);

    // Round 4
    a = transform(ii, a, b2, c, d, w[0], S[12], T[48]);
    d = transform(ii, d, a, b2, c, w[7], S[13], T[49]);
    c = transform(ii, c, d, a, b2, w[14], S[14], T[50]);
    b2 = transform(ii, b2, c, d, a, w[5], S[15], T[51]);
    a = transform(ii, a, b2, c, d, w[12], S[12], T[52]);
    d = transform(ii, d, a, b2, c, w[3], S[13], T[53]);
    c = transform(ii, c, d, a, b2, w[10], S[14], T[54]);
    b2 = transform(ii, b2, c, d, a, w[1], S[15], T[55]);
    a = transform(ii, a, b2, c, d, w[8], S[12], T[56]);
    d = transform(ii, d, a, b2, c, w[15], S[13], T[57]);
    c = transform(ii, c, d, a, b2, w[6], S[14], T[58]);
    b2 = transform(ii, b2, c, d, a, w[13], S[15], T[59]);
    a = transform(ii, a, b2, c, d, w[4], S[12], T[60]);
    d = transform(ii, d, a, b2, c, w[11], S[13], T[61]);
    c = transform(ii, c, d, a, b2, w[2], S[14], T[62]);
    b2 = transform(ii, b2, c, d, a, w[9], S[15], T[63]);

    a = addUnsigned(a, aa);
    b2 = addUnsigned(b2, bb);
    c = addUnsigned(c, cc);
    d = addUnsigned(d, dd);
  }

  const toHex = (n: number) =>
    [0, 8, 16, 24].map((s) => ((n >>> s) & 0xff).toString(16).padStart(2, "0")).join("");

  return toHex(a) + toHex(b2) + toHex(c) + toHex(d);
}

export default function HashGenerator() {
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
              Text
            </TabsTrigger>
            <TabsTrigger value="file" className="text-xs px-3 h-6">
              File
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <Button size="sm" variant="outline" onClick={handleClear}>
          Clear
        </Button>
      </div>

      {mode === "text" ? (
        <Textarea
          value={input}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="Type or paste text to hash..."
          className="min-h-[120px] font-mono text-sm"
        />
      ) : (
        <FileDropZone
          onFiles={handleFileUpload}
          label={fileName ? `Selected: ${fileName}` : "Drop a file here to hash"}
          className="min-h-[120px]"
        />
      )}

      {computing && (
        <p className="text-sm text-muted-foreground">Computing hashes...</p>
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
          Type text or drop a file to generate hashes.
        </div>
      )}
    </div>
  );
}
