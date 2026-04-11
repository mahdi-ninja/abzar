"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";

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

  const { matches, error, highlighted } = useMemo(() => {
    if (!pattern)
      return { matches: [] as MatchResult[], error: "", highlighted: testString };

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

      // Build highlighted string
      let html = "";
      let lastIndex = 0;
      for (const match of results) {
        html += escapeHtml(testString.slice(lastIndex, match.index));
        html += `<mark class="bg-primary/30 text-foreground rounded-sm px-0.5">${escapeHtml(match.full)}</mark>`;
        lastIndex = match.index + match.full.length;
      }
      html += escapeHtml(testString.slice(lastIndex));

      return { matches: results, error: "", highlighted: html };
    } catch (e) {
      return {
        matches: [] as MatchResult[],
        error: (e as Error).message,
        highlighted: testString,
      };
    }
  }, [pattern, testString, flagString, flags.g]);

  return (
    <div className="space-y-4">
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Test String</Label>
          <Textarea
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            placeholder="Enter text to test against..."
            className="min-h-[200px] font-mono text-sm"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">
              Matches ({matches.length})
            </Label>
          </div>
          <div
            className="min-h-[200px] overflow-auto whitespace-pre-wrap rounded-md border bg-muted/50 p-3 font-mono text-sm break-all"
            dangerouslySetInnerHTML={{ __html: highlighted }}
          />
        </div>
      </div>

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

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
