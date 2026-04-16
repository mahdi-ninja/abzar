import Fuse from "fuse.js";
import { getAllTools, type Tool } from "./tools-registry";
import enTools from "@/messages/en/tools.json";
import faTools from "@/messages/fa/tools.json";
import zhTools from "@/messages/zh/tools.json";
import esTools from "@/messages/es/tools.json";

type ToolMessages = Record<string, { name: string; description: string }>;

const toolMessages: Record<string, ToolMessages> = {
  en: (enTools as { tools: ToolMessages }).tools,
  fa: (faTools as { tools: ToolMessages }).tools,
  zh: (zhTools as { tools: ToolMessages }).tools,
  es: (esTools as { tools: ToolMessages }).tools,
};

type IndexedTool = Tool & { localName: string; localDesc: string };

const indexes: Record<string, Fuse<IndexedTool>> = {};

function ensureIndex(locale: string) {
  if (!indexes[locale]) {
    const translations = toolMessages[locale] ?? toolMessages.en;
    const items: IndexedTool[] = getAllTools().map((tool) => ({
      ...tool,
      localName: translations[tool.slug]?.name ?? tool.name,
      localDesc: translations[tool.slug]?.description ?? tool.description,
    }));
    indexes[locale] = new Fuse(items, {
      keys: [
        { name: "localName", weight: 0.4 },
        { name: "name", weight: 0.15 },
        { name: "localDesc", weight: 0.25 },
        { name: "tags", weight: 0.2 },
      ],
      threshold: 0.4,
      ignoreLocation: true,
      minMatchCharLength: 1,
    });
  }
}

export function searchTools(query: string, locale: string = "en"): Tool[] {
  const q = query.trim();
  if (!q) return [];
  ensureIndex(locale);
  return indexes[locale].search(q).map((r) => r.item);
}
