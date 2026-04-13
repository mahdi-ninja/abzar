"use client";

import { useState, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InputOutputLayout } from "@/components/ui/input-output-layout";

function JsonTree({ data, depth = 0 }: { data: unknown; depth?: number }) {
  if (data === null) return <span className="text-rose-500">null</span>;
  if (typeof data === "boolean")
    return <span className="text-rose-500">{String(data)}</span>;
  if (typeof data === "number")
    return <span className="text-amber-600 dark:text-amber-400">{data}</span>;
  if (typeof data === "string")
    return (
      <span className="text-emerald-600 dark:text-emerald-400">
        &quot;{data}&quot;
      </span>
    );

  if (Array.isArray(data)) {
    if (data.length === 0) return <span>{"[]"}</span>;
    return (
      <details open={depth < 2}>
        <summary className="cursor-pointer hover:text-primary">
          Array [{data.length}]
        </summary>
        <div className="ml-4 border-l border-border pl-2">
          {data.map((item, i) => (
            <div key={i} className="py-0.5">
              <span className="text-muted-foreground mr-1">{i}:</span>
              <JsonTree data={item} depth={depth + 1} />
            </div>
          ))}
        </div>
      </details>
    );
  }

  if (typeof data === "object") {
    const entries = Object.entries(data as Record<string, unknown>);
    if (entries.length === 0) return <span>{"{}"}</span>;
    return (
      <details open={depth < 2}>
        <summary className="cursor-pointer hover:text-primary">
          Object {"{"}
          {entries.length}
          {"}"}
        </summary>
        <div className="ml-4 border-l border-border pl-2">
          {entries.map(([key, value]) => (
            <div key={key} className="py-0.5">
              <span className="text-blue-600 dark:text-blue-400">
                &quot;{key}&quot;
              </span>
              <span className="text-muted-foreground">: </span>
              <JsonTree data={value} depth={depth + 1} />
            </div>
          ))}
        </div>
      </details>
    );
  }

  return <span>{String(data)}</span>;
}

export default function JsonFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [parsed, setParsed] = useState<unknown>(null);
  const [viewMode, setViewMode] = useState<"text" | "tree">("text");

  const handleFormat = useCallback(() => {
    try {
      const obj = JSON.parse(input);
      setOutput(JSON.stringify(obj, null, 2));
      setParsed(obj);
      setError("");
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
      setParsed(null);
    }
  }, [input]);

  const handleMinify = useCallback(() => {
    try {
      const obj = JSON.parse(input);
      setOutput(JSON.stringify(obj));
      setParsed(obj);
      setError("");
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
      setParsed(null);
    }
  }, [input]);

  const handleValidate = useCallback(() => {
    try {
      JSON.parse(input);
      setError("");
      setOutput("Valid JSON!");
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
    }
  }, [input]);

  const handleClear = useCallback(() => {
    setInput("");
    setOutput("");
    setError("");
    setParsed(null);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={handleFormat}>
          Format
        </Button>
        <Button size="sm" variant="secondary" onClick={handleMinify}>
          Minify
        </Button>
        <Button size="sm" variant="secondary" onClick={handleValidate}>
          Validate
        </Button>
        <Button size="sm" variant="outline" onClick={handleClear}>
          Clear
        </Button>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <InputOutputLayout
        inputLabel="Input"
        outputLabel="Output"
        input={
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Paste your JSON here... e.g. {"key": "value"}'
            className="min-h-75 font-mono text-sm"
          />
        }
        output={
          <>
            <div className="flex items-center justify-end gap-2">
              {output && <CopyButton value={output} />}
              {parsed !== null && (
                <Tabs
                  value={viewMode}
                  onValueChange={(v) => setViewMode(v as "text" | "tree")}
                >
                  <TabsList className="h-8">
                    <TabsTrigger value="text" className="text-xs px-2 h-6">
                      Text
                    </TabsTrigger>
                    <TabsTrigger value="tree" className="text-xs px-2 h-6">
                      Tree
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              )}
            </div>
            {viewMode === "text" || parsed === null ? (
              <Textarea
                value={output}
                readOnly
                placeholder="Formatted output will appear here"
                className="min-h-75 font-mono text-sm"
              />
            ) : (
              <div className="min-h-75 overflow-auto rounded-md border bg-muted/50 p-3 font-mono text-sm">
                <JsonTree data={parsed} />
              </div>
            )}
          </>
        }
      />
    </div>
  );
}
