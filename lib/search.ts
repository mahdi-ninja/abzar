import uFuzzy from "@leeoniya/ufuzzy";
import { getAllTools, type Tool } from "./tools-registry";

const uf = new uFuzzy();

let haystack: string[] | null = null;
let toolsList: Tool[] | null = null;

function ensureIndex() {
  if (!haystack) {
    toolsList = getAllTools();
    haystack = toolsList.map(
      (t) => `${t.name} ${t.description} ${t.tags.join(" ")}`
    );
  }
}

export function searchTools(query: string): Tool[] {
  if (!query.trim()) return [];
  ensureIndex();

  const [idxs, , order] = uf.search(haystack!, query);
  if (!idxs) return [];

  const ranked = order
    ? order.map((i) => toolsList![idxs[i]])
    : idxs.map((i) => toolsList![i]);

  return ranked;
}
