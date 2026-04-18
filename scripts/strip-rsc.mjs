import { readdir, stat, unlink } from "node:fs/promises";
import { join } from "node:path";

const OUT = "out";

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const htmlBases = new Set(
    entries
      .filter((e) => e.isFile() && e.name.endsWith(".html"))
      .map((e) => e.name.slice(0, -".html".length)),
  );

  let removed = 0;
  let bytes = 0;

  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      const res = await walk(path);
      removed += res.removed;
      bytes += res.bytes;
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith(".txt")) continue;

    const isNextMeta = entry.name.startsWith("__next.");
    const base = entry.name.slice(0, -".txt".length);
    const hasHtmlSibling = htmlBases.has(base);

    if (isNextMeta || hasHtmlSibling) {
      const { size } = await stat(path);
      await unlink(path);
      removed++;
      bytes += size;
    }
  }

  return { removed, bytes };
}

const { removed, bytes } = await walk(OUT);
const mb = (bytes / 1024 / 1024).toFixed(1);
console.log(`strip-rsc: removed ${removed} RSC payload(s), ${mb} MB`);
