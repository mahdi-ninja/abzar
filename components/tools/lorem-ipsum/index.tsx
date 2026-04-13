"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { CopyButton } from "@/components/ui/copy-button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CLASSIC = "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur Excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium totam rem aperiam eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit".split(" ");
const HIPSTER = "Artisan craft beer kombucha gentrify vinyl record aesthetic typewriter sriracha vegan fixie selfie meditation avocado toast sustainable cold-pressed organic matcha latte farm-to-table sourdough microdosing pour-over woke mindfulness plant-based adaptogen cruelty-free ethical slow-living zero-waste minimalist hygge kinfolk vintage thrifted upcycled biodegradable carbon-neutral fermented probiotic turmeric quinoa acai bowl smoothie yoga retreat wellness journaling gratitude breathwork sound-bath crystal healing".split(" ");
const CORPORATE = "Synergy leverage paradigm stakeholder deliverable bandwidth pipeline scalable robust ecosystem actionable innovative disruptive streamline optimize proactive holistic agile sprint milestone roadmap KPI metrics ROI engagement touchpoint alignment strategy framework initiative transformation digital cloud-native enterprise platform solution vertical integration horizontal diversification market penetration customer-centric value proposition competitive advantage thought leadership best practice mission-critical next-generation cutting-edge forward-thinking results-driven data-driven evidence-based outcome-focused revenue growth".split(" ");

function generateParagraph(words: string[], minLen: number, maxLen: number): string {
  const len = minLen + Math.floor(Math.random() * (maxLen - minLen));
  const sentence: string[] = [];
  for (let i = 0; i < len; i++) {
    sentence.push(words[Math.floor(Math.random() * words.length)]);
  }
  sentence[0] = sentence[0].charAt(0).toUpperCase() + sentence[0].slice(1);
  return sentence.join(" ") + ".";
}

function generate(style: string, count: number): string {
  const words = style === "hipster" ? HIPSTER : style === "corporate" ? CORPORATE : CLASSIC;
  return Array.from({ length: count }, () => {
    const sentences = 3 + Math.floor(Math.random() * 4);
    return Array.from({ length: sentences }, () => generateParagraph(words, 8, 18)).join(" ");
  }).join("\n\n");
}

export default function LoremIpsum() {
  const [style, setStyle] = useState("classic");
  const [count, setCount] = useState(3);
  const [output, setOutput] = useState(() => generate("classic", 3));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <Tabs value={style} onValueChange={(v) => { setStyle(v); setOutput(generate(v, count)); }}>
          <TabsList className="h-8">
            <TabsTrigger value="classic" className="text-xs px-2.5 h-6">Classic</TabsTrigger>
            <TabsTrigger value="hipster" className="text-xs px-2.5 h-6">Hipster</TabsTrigger>
            <TabsTrigger value="corporate" className="text-xs px-2.5 h-6">Corporate</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="w-40">
          <Label className="text-xs mb-1 block">Paragraphs: {count}</Label>
          <Slider value={[count]} onValueChange={(v) => { const n = Array.isArray(v) ? v[0] : v; setCount(n); setOutput(generate(style, n)); }} min={1} max={10} step={1} />
        </div>
      </div>
      <div className="flex justify-end"><CopyButton value={output} /></div>
      <Textarea value={output} readOnly className="min-h-75 text-sm" />
    </div>
  );
}
