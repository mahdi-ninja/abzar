"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TEXTS: Record<string, string[]> = {
  easy: [
    "The quick brown fox jumps over the lazy dog near the river bank on a warm summer day.",
    "A small cat sat on the mat and looked at the birds flying in the clear blue sky above.",
    "She walked to the store to buy some bread and milk for her family before dinner time.",
    "The sun was shining brightly and the children were playing happily in the park together.",
    "He opened the door slowly and stepped inside the room to find everything in its place.",
    "The flowers in the garden were blooming beautifully after the long rain that morning.",
    "We decided to go for a walk along the beach and watch the waves crash on the shore.",
    "The old man sat quietly on the bench reading his favorite book as the afternoon passed.",
    "They packed their bags and headed to the airport for their long awaited vacation trip.",
    "The dog ran across the yard and jumped over the fence to greet the neighbors warmly.",
    "I made a cup of coffee and sat down by the window to enjoy the view of the mountains.",
    "The train arrived at the station right on time and the passengers hurried to get aboard.",
    "She smiled when she saw the surprise party that her friends had planned for her birthday.",
    "The library was quiet and peaceful, a perfect place to study and focus on important work.",
    "They cooked a delicious meal together and shared stories about their day over dinner.",
  ],
  medium: [
    "Programming is the art of telling a computer what to do through a series of instructions written in a specific language that the machine can understand and execute.",
    "The development of modern technology has significantly transformed the way people communicate, work, and interact with each other across vast distances around the globe.",
    "Scientists have discovered that regular exercise not only improves physical health but also enhances cognitive function and reduces the risk of developing various mental disorders.",
    "Understanding the fundamentals of web development requires knowledge of HTML for structure, CSS for styling, and JavaScript for interactivity and dynamic content manipulation.",
    "The concept of artificial intelligence has evolved from simple rule-based systems to complex neural networks capable of learning patterns from massive datasets.",
    "Climate change remains one of the most pressing challenges facing humanity, requiring coordinated international efforts to reduce greenhouse gas emissions and develop sustainable energy solutions.",
    "The history of computing stretches back centuries, from early mechanical calculators to the modern silicon-based microprocessors that power billions of devices worldwide.",
    "Effective project management involves careful planning, clear communication, risk assessment, and the ability to adapt to changing requirements while maintaining quality standards.",
    "The global economy depends on complex supply chains that move goods across continents, connecting manufacturers, distributors, and consumers in an intricate web of trade relationships.",
    "Learning a new programming language is similar to learning a spoken language: it requires understanding grammar rules, building vocabulary, and practicing through regular usage and experimentation.",
    "Database management systems are essential components of modern software architecture, providing reliable storage, retrieval, and manipulation of structured and unstructured data at scale.",
    "The principles of user experience design emphasize creating products that are not only functional but also intuitive, accessible, and enjoyable for people with diverse needs and abilities.",
    "Version control systems like Git have revolutionized collaborative software development by enabling teams to work on the same codebase simultaneously without overwriting each other's changes.",
    "Cybersecurity threats continue to evolve in sophistication, making it crucial for organizations to implement multi-layered defense strategies and maintain vigilant monitoring of their digital infrastructure.",
    "The rise of remote work has fundamentally changed how companies operate, requiring new tools and approaches for collaboration, communication, and maintaining team cohesion across time zones.",
  ],
  hard: [
    "Asynchronous JavaScript execution leverages event-driven, non-blocking I/O operations, enabling efficient handling of concurrent requests without multithreading complexities inherent in traditional synchronous paradigms.",
    "Quantum entanglement demonstrates instantaneous correlations between particles regardless of spatial separation, challenging classical physics' locality principle and enabling revolutionary cryptographic applications.",
    "The juxtaposition of Keynesian macroeconomic theory with monetarist perspectives reveals fundamentally divergent assumptions about fiscal multipliers, liquidity preferences, and self-correcting market equilibria.",
    "Implementing microservices architecture necessitates comprehensive observability infrastructure including distributed tracing, centralized logging, and sophisticated service mesh configurations for inter-service communication.",
    "The philosophical implications of Godel's incompleteness theorems extend beyond mathematical logic, suggesting fundamental epistemological constraints on any sufficiently complex axiomatic system's self-referential capabilities.",
    "Containerization technologies like Docker and Kubernetes have transformed deployment paradigms by abstracting infrastructure dependencies, enabling reproducible environments, and facilitating horizontal scalability across heterogeneous clusters.",
    "The neuroplasticity of the human brain enables continuous synaptic reorganization throughout adulthood, challenging previously held assumptions about critical developmental periods and fixed cognitive architectures.",
    "Functional programming paradigms emphasize immutability, higher-order functions, and referential transparency, providing mathematical guarantees about program behavior that imperative approaches fundamentally cannot offer.",
    "Distributed consensus algorithms such as Raft and Paxos address the fundamental challenge of maintaining consistent state across unreliable networks while tolerating Byzantine failures and network partitions.",
    "The intersection of differential privacy and machine learning presents novel challenges in balancing statistical utility with mathematical guarantees of individual privacy in increasingly data-driven algorithmic systems.",
    "Cryptographic zero-knowledge proofs enable verification of computational statements without revealing underlying data, representing a paradigmatic shift in how authentication and authorization protocols are architecturally conceived.",
    "The ergodic hypothesis in statistical mechanics postulates that time averages of physical observables converge to ensemble averages, providing the theoretical foundation for thermodynamic equilibrium predictions.",
    "Advanced compiler optimization techniques including loop vectorization, register allocation via graph coloring, and interprocedural analysis fundamentally determine the performance characteristics of compiled executables.",
    "Topological quantum computing exploits anyonic braiding operations in two-dimensional systems to encode information in inherently fault-tolerant quantum states resistant to local perturbation and decoherence.",
    "The Curry-Howard correspondence establishes a profound isomorphism between intuitionistic logic propositions and typed lambda calculus expressions, unifying proof theory with computational type systems.",
  ],
};

export default function TypingTest() {
  const [difficulty, setDifficulty] = useState("medium");
  const [targetText, setTargetText] = useState(() => {
    const pool = TEXTS["medium"];
    return pool[Math.floor(Math.random() * pool.length)];
  });
  const [typed, setTyped] = useState("");
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const pickText = useCallback((diff: string) => {
    const pool = TEXTS[diff] || TEXTS.medium;
    setTargetText(pool[Math.floor(Math.random() * pool.length)]);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleStart = useCallback(() => {
    stopTimer();
    pickText(difficulty);
    setTyped("");
    setFinished(false);
    setElapsed(0);

    const now = Date.now();
    setStartTime(now);
    setStarted(true);

    timerRef.current = setInterval(() => {
      setElapsed(Date.now() - now);
    }, 100);

    setTimeout(() => inputRef.current?.focus(), 50);
  }, [difficulty, pickText, stopTimer]);

  useEffect(() => {
    return stopTimer;
  }, [stopTimer]);

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!started || finished) return;
      const val = e.target.value;
      setTyped(val);

      if (val.length >= targetText.length) {
        setFinished(true);
        setElapsed(Date.now() - startTime);
        stopTimer();
      }
    },
    [started, finished, targetText, startTime, stopTimer]
  );

  const seconds = elapsed / 1000;
  const words = typed.trim().split(/\s+/).filter(Boolean).length;
  const wpm = seconds > 0 ? Math.round((words / seconds) * 60) : 0;
  const correctChars = typed.split("").filter((c, i) => c === targetText[i]).length;
  const accuracy = typed.length > 0 ? Math.round((correctChars / typed.length) * 100) : 100;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <Label className="text-sm mb-1 block">Difficulty</Label>
          <Select value={difficulty} onValueChange={(v) => { if (v) { setDifficulty(v); pickText(v); } }} disabled={started && !finished}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {!started || finished ? (
          <Button onClick={handleStart}>{finished ? "Try Again" : "Start"}</Button>
        ) : (
          <Button variant="outline" onClick={() => { stopTimer(); setStarted(false); setFinished(false); setTyped(""); setElapsed(0); pickText(difficulty); }}>
            Reset
          </Button>
        )}
      </div>

      {/* Target text */}
      <div
        className="rounded-lg border bg-muted/50 p-4 font-mono text-base leading-relaxed select-none cursor-text"
        onClick={() => inputRef.current?.focus()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") inputRef.current?.focus(); }}
      >
        {targetText.split("").map((char, i) => {
          let cls = "text-muted-foreground/60";
          if (i < typed.length) {
            cls = typed[i] === char ? "text-emerald-500" : "text-destructive bg-destructive/10";
          } else if (i === typed.length && started && !finished) {
            cls = "text-foreground bg-primary/20";
          }
          return <span key={i} className={cls}>{char}</span>;
        })}
      </div>

      <input
        ref={inputRef}
        type="text"
        value={typed}
        onChange={handleInput}
        disabled={!started || finished}
        className="sr-only"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        aria-label="Type here"
      />

      {started && !finished && (
        <p className="text-xs text-muted-foreground text-center">
          Click the text above if typing stops working.
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="p-3 text-center">
          <div className="text-2xl font-bold tabular-nums">{wpm}</div>
          <div className="text-xs text-muted-foreground">WPM</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-2xl font-bold tabular-nums">{accuracy}%</div>
          <div className="text-xs text-muted-foreground">Accuracy</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-2xl font-bold tabular-nums">{seconds.toFixed(1)}s</div>
          <div className="text-xs text-muted-foreground">Time</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-2xl font-bold tabular-nums">{typed.length}/{targetText.length}</div>
          <div className="text-xs text-muted-foreground">Characters</div>
        </Card>
      </div>

      {finished && (
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold">
            {wpm >= 80 ? "Excellent!" : wpm >= 50 ? "Good job!" : "Keep practicing!"}
          </p>
        </div>
      )}
    </div>
  );
}
