import { build } from "esbuild";
import { injectManifest } from "workbox-build";

// Step 1: Bundle the SW TypeScript source into a single JS file.
// esbuild is available as a transitive dep of Next.js.
await build({
  entryPoints: ["sw/index.ts"],
  bundle: true,
  outfile: "out/sw.js",
  format: "iife",
  minify: true,
  define: {
    "process.env.NODE_ENV": '"production"',
  },
});

// Step 2: Inject the precache manifest into the bundled SW.
// workbox-build scans out/ and replaces self.__WB_MANIFEST with the file list.
const { count, size, warnings } = await injectManifest({
  swSrc: "out/sw.js",
  swDest: "out/sw.js",
  globDirectory: "out",
  globPatterns: [
    "{en,fa,zh,es}.html",
    "{en,fa,zh,es}/tools/*.html",
    "offline.html",
    "_next/static/chunks/*.css",
    "_next/static/*/_buildManifest.js",
    "_next/static/*/_ssgManifest.js",
    "_next/static/media/*.woff2",
  ],
  globIgnores: [
    "**/*.txt",
    "og/**",
  ],
  maximumFileSizeToCacheInBytes: 500 * 1024,
});

if (warnings.length > 0) {
  console.warn("Workbox warnings:", warnings.join("\n"));
}

console.log(
  `SW generated: ${count} files precached (${(size / 1024).toFixed(0)} KB)`
);
