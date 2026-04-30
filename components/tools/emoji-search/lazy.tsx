"use client";

import dynamic from "next/dynamic";
import { ToolSkeleton } from "@/components/layout/tool-skeleton";

const EmojiSearch = dynamic(() => import("@/components/tools/emoji-search"), {
  loading: () => <ToolSkeleton />,
  ssr: false,
});

export default EmojiSearch;
