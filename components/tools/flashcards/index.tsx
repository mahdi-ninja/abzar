"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useLocalStorage } from "@/lib/use-local-storage";

interface Flashcard {
  id: string;
  front: string;
  back: string;
  box: number; // Leitner box 1-5
}

export default function Flashcards() {
  const t = useTranslations("flashcards");
  const [cards, setCards] = useLocalStorage<Flashcard[]>("abzar:flashcards:cards", []);
  const [view, setView] = useState<"manage" | "study">("manage");
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [studyIndex, setStudyIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [studyQueue, setStudyQueue] = useState<Flashcard[]>([]);

  const currentCard = studyQueue[studyIndex] ?? null;

  const addCard = useCallback(() => {
    if (!front.trim() || !back.trim()) return;
    setCards((prev) => [
      ...prev,
      { id: Date.now().toString(), front: front.trim(), back: back.trim(), box: 1 },
    ]);
    setFront("");
    setBack("");
  }, [front, back, setCards]);

  const removeCard = useCallback(
    (id: string) => {
      setCards((prev) => prev.filter((c) => c.id !== id));
    },
    [setCards]
  );

  const handleAnswer = useCallback(
    (correct: boolean) => {
      if (!currentCard) return;
      setCards((prev) =>
        prev.map((c) =>
          c.id === currentCard.id
            ? { ...c, box: correct ? Math.min(5, c.box + 1) : 1 }
            : c
        )
      );
      setShowAnswer(false);
      setStudyIndex((prev) => (prev + 1 >= studyQueue.length ? 0 : prev + 1));
    },
    [currentCard, setCards, studyQueue.length]
  );

  const startStudy = useCallback(() => {
    setStudyQueue([...cards].sort((a, b) => a.box - b.box));
    setView("study");
    setStudyIndex(0);
    setShowAnswer(false);
  }, [cards]);

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={view === "manage" ? "default" : "outline"}
          onClick={() => setView("manage")}
        >
          {t("manage", { count: cards.length })}
        </Button>
        <Button
          size="sm"
          variant={view === "study" ? "default" : "outline"}
          onClick={startStudy}
          disabled={cards.length === 0}
        >
          {t("study")}
        </Button>
      </div>

      {view === "manage" && (
        <>
          {/* Add card form */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label className="text-sm mb-1 block">{t("frontLabel")}</Label>
              <Textarea
                value={front}
                onChange={(e) => setFront(e.target.value)}
                placeholder={t("frontPlaceholder")}
                className="min-h-20 text-sm"
              />
            </div>
            <div>
              <Label className="text-sm mb-1 block">{t("backLabel")}</Label>
              <Textarea
                value={back}
                onChange={(e) => setBack(e.target.value)}
                placeholder={t("backPlaceholder")}
                className="min-h-20 text-sm"
              />
            </div>
          </div>
          <Button size="sm" onClick={addCard} disabled={!front.trim() || !back.trim()}>
            {t("addCard")}
          </Button>

          {/* Card list */}
          {cards.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t("cardsCount", { count: cards.length })}</Label>
              <div className="max-h-64 overflow-auto space-y-2">
                {cards.map((card) => (
                  <Card key={card.id} className="p-3 flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{card.front}</div>
                      <div className="text-xs text-muted-foreground truncate">{card.back}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-muted-foreground">{t("box", { box: card.box })}</span>
                      <button
                        onClick={() => removeCard(card.id)}
                        className="text-muted-foreground hover:text-destructive text-sm"
                      >
                        ×
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {cards.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              {t("emptyState")}
            </p>
          )}
        </>
      )}

      {view === "study" && (
        <>
          {currentCard ? (
            <div className="flex flex-col items-center gap-6">
              <div className="text-xs text-muted-foreground">
                {t("cardProgress", { current: studyIndex + 1, total: studyQueue.length, box: currentCard.box })}
              </div>

              <Card
                className="w-full max-w-md min-h-50 flex items-center justify-center p-8 cursor-pointer text-center"
                onClick={() => setShowAnswer(true)}
              >
                {!showAnswer ? (
                  <div>
                    <div className="text-lg font-medium">{currentCard.front}</div>
                    <div className="text-xs text-muted-foreground mt-3">
                      {t("clickToReveal")}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-xs text-muted-foreground mb-2">{t("answer")}</div>
                    <div className="text-lg font-medium">{currentCard.back}</div>
                  </div>
                )}
              </Card>

              {showAnswer && (
                <div className="flex gap-3">
                  <Button variant="destructive" size="sm" onClick={() => handleAnswer(false)}>
                    {t("incorrect")}
                  </Button>
                  <Button size="sm" onClick={() => handleAnswer(true)}>
                    {t("correct")}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              {t("noCardsToStudy")}
            </p>
          )}
        </>
      )}
    </div>
  );
}
