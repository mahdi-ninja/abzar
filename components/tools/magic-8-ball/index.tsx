"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ANSWERS = [
  "It is certain", "It is decidedly so", "Without a doubt", "Yes definitely", "You may rely on it",
  "As I see it, yes", "Most likely", "Outlook good", "Yes", "Signs point to yes",
  "Reply hazy, try again", "Ask again later", "Better not tell you now", "Cannot predict now", "Concentrate and ask again",
  "Don't count on it", "My reply is no", "My sources say no", "Outlook not so good", "Very doubtful",
];

export default function Magic8Ball() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [shaking, setShaking] = useState(false);

  const shake = useCallback(() => {
    setShaking(true);
    setAnswer("");
    setTimeout(() => {
      setAnswer(ANSWERS[Math.floor(Math.random() * ANSWERS.length)]);
      setShaking(false);
    }, 800);
  }, []);

  return (
    <div className="space-y-6 flex flex-col items-center">
      <Input value={question} onChange={(e) => setQuestion(e.target.value)} onKeyDown={(e) => e.key === "Enter" && shake()} placeholder="Ask a yes/no question..." className="max-w-md text-center" />
      <div
        className={`relative h-56 w-56 rounded-full bg-gradient-to-b from-gray-800 to-black flex items-center justify-center shadow-2xl cursor-pointer select-none ${shaking ? "animate-bounce" : ""}`}
        onClick={shake}
      >
        <div className="h-24 w-24 rounded-full bg-gradient-to-b from-blue-900 to-blue-950 flex items-center justify-center border-2 border-blue-800">
          <span className="text-white text-center text-xs font-medium px-2 leading-tight">
            {answer || (shaking ? "..." : "8")}
          </span>
        </div>
      </div>
      <Button onClick={shake} disabled={shaking}>{shaking ? "Shaking..." : "Shake"}</Button>
    </div>
  );
}
