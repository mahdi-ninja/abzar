import Fuse from "fuse.js";
import { getAllTools, type Tool } from "./tools-registry";

let fuse: Fuse<Tool> | null = null;

function ensureIndex() {
  if (!fuse) {
    fuse = new Fuse(getAllTools(), {
      keys: [
        { name: "name", weight: 0.5 },
        { name: "description", weight: 0.3 },
        { name: "tags", weight: 0.2 },
      ],
      threshold: 0.4,
      ignoreLocation: true,
      minMatchCharLength: 1,
    });
  }
}

export function searchTools(query: string): Tool[] {
  const q = query.trim();
  if (!q) return [];
  ensureIndex();
  return fuse!.search(q).map((r) => r.item);
}
