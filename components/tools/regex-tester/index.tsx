"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CopyButton } from "@/components/ui/copy-button";
import { Button } from "@/components/ui/button";
import { InputOutputLayout } from "@/components/ui/input-output-layout";

interface MatchResult {
  full: string;
  index: number;
  groups: string[];
}

export default function RegexTester() {
  const [pattern, setPattern] = useState("");
  const [testString, setTestString] = useState("");
  const [flags, setFlags] = useState({ g: true, i: false, m: false, s: false });

  const flagString = Object.entries(flags)
    .filter(([, v]) => v)
    .map(([k]) => k)
    .join("");

  const { matches, error, segments } = useMemo(() => {
    if (!pattern)
      return { matches: [] as MatchResult[], error: "", segments: [{ text: testString, highlight: false }] };

    try {
      const re = new RegExp(pattern, flagString);
      const results: MatchResult[] = [];

      if (flags.g) {
        let m: RegExpExecArray | null;
        while ((m = re.exec(testString)) !== null) {
          results.push({
            full: m[0],
            index: m.index,
            groups: m.slice(1),
          });
          if (m[0].length === 0) re.lastIndex++;
        }
      } else {
        const m = re.exec(testString);
        if (m) {
          results.push({
            full: m[0],
            index: m.index,
            groups: m.slice(1),
          });
        }
      }

      // Build segments for React rendering
      const segs: { text: string; highlight: boolean }[] = [];
      let lastIndex = 0;
      for (const match of results) {
        if (match.index > lastIndex) {
          segs.push({ text: testString.slice(lastIndex, match.index), highlight: false });
        }
        segs.push({ text: match.full, highlight: true });
        lastIndex = match.index + match.full.length;
      }
      if (lastIndex < testString.length) {
        segs.push({ text: testString.slice(lastIndex), highlight: false });
      }

      return { matches: results, error: "", segments: segs };
    } catch (e) {
      return {
        matches: [] as MatchResult[],
        error: (e as Error).message,
        segments: [{ text: testString, highlight: false }],
      };
    }
  }, [pattern, testString, flagString, flags.g]);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" variant="outline" onClick={() => { setPattern(""); setTestString(""); setFlags({ g: true, i: false, m: false, s: false }); }}>Clear</Button>
      </div>

      {/* Pattern input */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Regular Expression</Label>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground font-mono">/</span>
          <Input
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="Enter regex pattern..."
            className="font-mono text-sm"
          />
          <span className="text-muted-foreground font-mono">
            /{flagString}
          </span>
          <CopyButton value={`/${pattern}/${flagString}`} label="" />
        </div>
      </div>

      {/* Flags */}
      <div className="flex flex-wrap gap-4">
        {(
          [
            ["g", "Global"],
            ["i", "Case insensitive"],
            ["m", "Multiline"],
            ["s", "Dotall"],
          ] as const
        ).map(([key, label]) => (
          <div key={key} className="flex items-center gap-1.5">
            <Switch
              checked={flags[key]}
              onCheckedChange={(checked) =>
                setFlags((prev) => ({ ...prev, [key]: checked }))
              }
            />
            <Label className="text-xs">{label} ({key})</Label>
          </div>
        ))}
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Test string + highlighted output */}
      <InputOutputLayout
        inputLabel="Test String"
        outputLabel={`Matches (${matches.length})`}
        input={
          <Textarea
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            placeholder="Enter text to test against..."
            className="min-h-50 font-mono text-sm"
          />
        }
        output={
          <div className="min-h-50 overflow-auto whitespace-pre-wrap rounded-md border bg-muted/50 p-3 font-mono text-sm break-all">
            {segments.map((seg, i) =>
              seg.highlight ? (
                <mark key={i} className="bg-primary/30 text-foreground rounded-sm px-0.5">{seg.text}</mark>
              ) : (
                <span key={i}>{seg.text}</span>
              )
            )}
          </div>
        }
      />

      {/* Capture groups */}
      {matches.length > 0 && matches.some((m) => m.groups.length > 0) && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Capture Groups</Label>
          <div className="overflow-auto rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-3 py-1.5 text-left font-medium">#</th>
                  <th className="px-3 py-1.5 text-left font-medium">Match</th>
                  <th className="px-3 py-1.5 text-left font-medium">Index</th>
                  <th className="px-3 py-1.5 text-left font-medium">Groups</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((m, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="px-3 py-1.5 font-mono text-muted-foreground">
                      {i + 1}
                    </td>
                    <td className="px-3 py-1.5 font-mono">{m.full}</td>
                    <td className="px-3 py-1.5 font-mono text-muted-foreground">
                      {m.index}
                    </td>
                    <td className="px-3 py-1.5 font-mono">
                      {m.groups.map((g, gi) => (
                        <span key={gi} className="mr-2">
                          <span className="text-muted-foreground">${gi + 1}:</span>{" "}
                          {g ?? "undefined"}
                        </span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
