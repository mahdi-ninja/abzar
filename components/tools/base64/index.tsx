"use client";

import { useState, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileDropZone } from "@/components/ui/file-drop-zone";
import { InputOutputLayout } from "@/components/ui/input-output-layout";

export default function Base64Tool() {
  const [mode, setMode] = useState<"text" | "file">("text");
  const [direction, setDirection] = useState<"encode" | "decode">("encode");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");

  const handleTextConvert = useCallback(
    (text: string, dir: "encode" | "decode") => {
      setError("");
      try {
        if (dir === "encode") {
          setOutput(btoa(unescape(encodeURIComponent(text))));
        } else {
          setOutput(decodeURIComponent(escape(atob(text.trim()))));
        }
      } catch {
        setError(
          dir === "decode"
            ? "Invalid Base64 string"
            : "Failed to encode text"
        );
        setOutput("");
      }
    },
    []
  );

  const handleInputChange = useCallback(
    (value: string) => {
      setInput(value);
      if (value.trim()) {
        handleTextConvert(value, direction);
      } else {
        setOutput("");
        setError("");
      }
    },
    [direction, handleTextConvert]
  );

  const handleDirectionToggle = useCallback(
    (dir: "encode" | "decode") => {
      setDirection(dir);
      if (input.trim()) {
        handleTextConvert(input, dir);
      }
    },
    [input, handleTextConvert]
  );

  const handleFileUpload = useCallback((files: File[]) => {
    const file = files[0];
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Extract base64 part from data URI
      const base64 = result.split(",")[1] || result;
      setOutput(base64);
      setInput(`[File: ${file.name} — ${(file.size / 1024).toFixed(1)}KB]`);
      setError("");
    };
    reader.onerror = () => setError("Failed to read file");
    reader.readAsDataURL(file);
  }, []);

  const handleClear = useCallback(() => {
    setInput("");
    setOutput("");
    setError("");
    setFileName("");
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
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

        {mode === "text" && (
          <Tabs value={direction} onValueChange={(v) => handleDirectionToggle(v as "encode" | "decode")}>
            <TabsList className="h-8">
              <TabsTrigger value="encode" className="text-xs px-3 h-6">
                Encode
              </TabsTrigger>
              <TabsTrigger value="decode" className="text-xs px-3 h-6">
                Decode
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}

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
        inputLabel={mode === "text" ? "Input" : "File"}
        outputLabel="Output"
        input={
          mode === "text" ? (
            <Textarea
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={
                direction === "encode"
                  ? "Type text to encode..."
                  : "Paste Base64 to decode..."
              }
              className="min-h-50 font-mono text-sm"
            />
          ) : (
            <FileDropZone
              onFiles={handleFileUpload}
              label={
                fileName
                  ? `Selected: ${fileName}`
                  : "Drop a file here to encode"
              }
              className="min-h-50"
            />
          )
        }
        output={
          <>
            {output && <div className="flex justify-end"><CopyButton value={output} /></div>}
            <Textarea
              value={output}
              readOnly
              placeholder="Result will appear here"
              className="min-h-50 font-mono text-sm"
            />
            {output && (
              <p className="text-xs text-muted-foreground">
                {output.length.toLocaleString()} characters
              </p>
            )}
          </>
        }
      />
    </div>
  );
}
