"use client";

import { useState, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ANSWER_KEYS = [
  "certain", "decidedly", "withoutDoubt", "yesDefinitely", "rely",
  "asISeeIt", "mostLikely", "outlookGood", "yes", "signsYes",
  "hazy", "askAgain", "betterNot", "cannotPredict", "concentrate",
  "dontCount", "replyNo", "sourcesNo", "outlookBad", "doubtful",
] as const;

export default function Magic8Ball() {
  const t = useTranslations("magic8Ball");
  const [question, setQuestion] = useState("");
  const [answerKey, setAnswerKey] = useState("");
  const [shaking, setShaking] = useState(false);

  const answer = useMemo(
    () => (answerKey ? t(`answers.${answerKey}`) : ""),
    [answerKey, t]
  );

  const shake = useCallback(() => {
    setShaking(true);
    setAnswerKey("");
    setTimeout(() => {
      setAnswerKey(ANSWER_KEYS[Math.floor(Math.random() * ANSWER_KEYS.length)]);
      setShaking(false);
    }, 800);
  }, []);

  return (
    <div className="space-y-6 flex flex-col items-center">
      <Input value={question} onChange={(e) => setQuestion(e.target.value)} onKeyDown={(e) => e.key === "Enter" && shake()} placeholder={t("placeholder")} className="max-w-md text-center" />
      <div
        className={`relative h-56 w-56 rounded-full bg-linear-to-b from-gray-800 to-black flex items-center justify-center shadow-2xl cursor-pointer select-none ${shaking ? "animate-bounce" : ""}`}
        onClick={shake}
      >
        <div className="h-24 w-24 rounded-full bg-linear-to-b from-blue-900 to-blue-950 flex items-center justify-center border-2 border-blue-800">
          <span className="text-white text-center text-xs font-medium px-2 leading-tight">
            {answer || (shaking ? "..." : "8")}
          </span>
        </div>
      </div>
      <div className="flex gap-2">
        <Button onClick={shake} disabled={shaking}>{shaking ? t("shaking") : t("shake")}</Button>
        <Button size="sm" variant="outline" onClick={() => { setQuestion(""); setAnswerKey(""); }}>{t("clear")}</Button>
      </div>
    </div>
  );
}
