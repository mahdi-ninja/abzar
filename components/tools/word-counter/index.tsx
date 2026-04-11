"use client";

import { useState, useMemo } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

function countSentences(text: string): number {
  if (!text.trim()) return 0;
  return (text.match(/[.!?]+\s/g) || []).length + (text.trim().match(/[.!?]+$/) ? 1 : 0) || (text.trim().length > 0 ? 1 : 0);
}

function countParagraphs(text: string): number {
  if (!text.trim()) return 0;
  return text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length || 1;
}

function fleschKincaid(words: number, sentences: number, syllables: number): number {
  if (words === 0 || sentences === 0) return 0;
  return Math.round(
    (206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words)) * 10
  ) / 10;
}

function gunningFog(words: number, sentences: number, complexWords: number): number {
  if (words === 0 || sentences === 0) return 0;
  return Math.round((0.4 * (words / sentences + 100 * (complexWords / words))) * 10) / 10;
}

function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, "");
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
  word = word.replace(/^y/, "");
  const m = word.match(/[aeiouy]{1,2}/g);
  return m ? m.length : 1;
}

export default function WordCounter() {
  const [text, setText] = useState("");

  const stats = useMemo(() => {
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s/g, "").length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const sentences = countSentences(text);
    const paragraphs = countParagraphs(text);

    const wordList = text.trim() ? text.trim().split(/\s+/) : [];
    const totalSyllables = wordList.reduce(
      (sum, w) => sum + countSyllables(w),
      0
    );
    const complexWords = wordList.filter((w) => countSyllables(w) >= 3).length;

    const fk = fleschKincaid(words, sentences, totalSyllables);
    const fog = gunningFog(words, sentences, complexWords);

    const readingTime = Math.max(1, Math.ceil(words / 250));
    const speakingTime = Math.max(1, Math.ceil(words / 150));

    return {
      chars,
      charsNoSpaces,
      words,
      sentences,
      paragraphs,
      fk,
      fog,
      readingTime,
      speakingTime,
    };
  }, [text]);

  return (
    <div className="space-y-4">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type or paste your text here..."
        className="min-h-[200px] text-sm"
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {[
          { label: "Words", value: stats.words },
          { label: "Characters", value: stats.chars },
          { label: "No spaces", value: stats.charsNoSpaces },
          { label: "Sentences", value: stats.sentences },
          { label: "Paragraphs", value: stats.paragraphs },
        ].map((item) => (
          <Card key={item.label} className="p-3 text-center">
            <div className="text-2xl font-bold tabular-nums">
              {item.value.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">{item.label}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="p-3 text-center">
          <div className="text-lg font-bold tabular-nums">{stats.fk}</div>
          <div className="text-xs text-muted-foreground">
            Flesch-Kincaid
          </div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-lg font-bold tabular-nums">{stats.fog}</div>
          <div className="text-xs text-muted-foreground">
            Gunning Fog
          </div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-lg font-bold tabular-nums">
            {stats.readingTime} min
          </div>
          <div className="text-xs text-muted-foreground">Reading time</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-lg font-bold tabular-nums">
            {stats.speakingTime} min
          </div>
          <div className="text-xs text-muted-foreground">Speaking time</div>
        </Card>
      </div>
    </div>
  );
}
