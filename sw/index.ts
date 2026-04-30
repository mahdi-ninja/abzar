import { precacheAndRoute, cleanupOutdatedCaches, matchPrecache } from "workbox-precaching";
import { registerRoute, setCatchHandler } from "workbox-routing";
import { StaleWhileRevalidate, CacheFirst } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";

declare const self: ServiceWorkerGlobalScope;

// ── Precaching ──────────────────────────────────────────────────────
// workbox-build injectManifest replaces this with the actual manifest
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// ── Runtime: hashed static assets (immutable) ───────────────────────
registerRoute(
  ({ url }) => url.pathname.startsWith("/_next/static/"),
  new CacheFirst({
    cacheName: "abzar-static-v1",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 500,
        maxAgeSeconds: 365 * 24 * 60 * 60,
      }),
    ],
  })
);

// ── Runtime: font files ─────────────────────────────────────────────
registerRoute(
  ({ url }) => /\.woff2?$/.test(url.pathname),
  new CacheFirst({
    cacheName: "abzar-fonts-v1",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 365 * 24 * 60 * 60,
      }),
    ],
  })
);

// ── Runtime: HTML pages (tool pages cached on visit) ────────────────
registerRoute(
  ({ request, url }) =>
    request.mode === "navigate" &&
    !url.pathname.startsWith("/_next/"),
  new StaleWhileRevalidate({
    cacheName: "abzar-runtime-v1",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 250,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  })
);

// ── Offline fallback for uncached navigations ───────────────────────
setCatchHandler(async ({ request }) => {
  if (request.mode === "navigate") {
    const cached = await matchPrecache("offline.html");
    if (cached) return cached;
  }
  return Response.error();
});

// ── Update lifecycle ────────────────────────────────────────────────
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
