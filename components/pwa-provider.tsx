"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  useSyncExternalStore,
} from "react";
import { toast } from "sonner";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface PwaContextValue {
  isOffline: boolean;
  isInstallable: boolean;
  promptInstall: () => Promise<void>;
  applyUpdate: () => void;
}

const PwaContext = createContext<PwaContextValue>({
  isOffline: false,
  isInstallable: false,
  promptInstall: async () => {},
  applyUpdate: () => {},
});

export function usePwa() {
  return useContext(PwaContext);
}

// ── Module-level offline store (survives component re-mounts) ─────────
let offlineState = false;
const offlineListeners = new Set<() => void>();

function setOffline(value: boolean) {
  if (offlineState === value) return;
  offlineState = value;
  offlineListeners.forEach((l) => l());
}

function subscribeOffline(listener: () => void) {
  offlineListeners.add(listener);
  return () => {
    offlineListeners.delete(listener);
  };
}

function getOfflineSnapshot() {
  return offlineState;
}

function getOfflineServerSnapshot() {
  return false;
}

let offlineListenersRegistered = false;

if (typeof window !== "undefined" && !offlineListenersRegistered) {
  offlineListenersRegistered = true;

  // Verify actual connectivity — navigator.onLine is unreliable (returns true
  // when SW serves cached responses). A HEAD fetch to a non-SW-cached resource
  // hits the real network.
  fetch("/site.webmanifest", { method: "HEAD", cache: "no-store" })
    .catch(() => setOffline(true));

  window.addEventListener("offline", () => setOffline(true));
  window.addEventListener("online", () => {
    fetch("/site.webmanifest", { method: "HEAD", cache: "no-store" })
      .then(() => setOffline(false))
      .catch(() => {
        /* still offline */
      });
  });
}

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const isOffline = useSyncExternalStore(
    subscribeOffline,
    getOfflineSnapshot,
    getOfflineServerSnapshot,
  );
  const [isInstallable, setIsInstallable] = useState(false);

  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);
  const waitingSwRef = useRef<ServiceWorker | null>(null);

  // ── Apply update: tell waiting SW to skip waiting ─────────────────
  const applyUpdate = useCallback(() => {
    const sw = waitingSwRef.current;
    if (!sw) return;
    sw.postMessage({ type: "SKIP_WAITING" });
  }, []);

  // ── Prompt install: show native install dialog ────────────────────
  const promptInstall = useCallback(async () => {
    const prompt = deferredPromptRef.current;
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") {
      setIsInstallable(false);
      toast.success("Abzar installed!");
    }
    deferredPromptRef.current = null;
  }, []);

  // ── Offline / online toast ────────────────────────────────────────
  useEffect(() => {
    if (isOffline) {
      toast.warning("You're offline", {
        description: "Some tools may not be available.",
        duration: Infinity,
        id: "offline-status",
      });
    } else {
      toast.dismiss("offline-status");
    }
  }, [isOffline]);

  // ── Service worker registration ───────────────────────────────────
  useEffect(() => {
    if (
      typeof navigator === "undefined" ||
      !("serviceWorker" in navigator) ||
      process.env.NODE_ENV !== "production"
    )
      return;

    let updateInterval: ReturnType<typeof setInterval>;

    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        // Check for updates every 60 minutes
        updateInterval = setInterval(
          () => registration.update(),
          60 * 60 * 1000
        );

        const onUpdateFound = () => {
          const newSw = registration.installing;
          if (!newSw) return;

          newSw.addEventListener("statechange", () => {
            // New SW installed + there's already a controller = this is an update
            if (
              newSw.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              waitingSwRef.current = newSw;
              toast.info("Update available", {
                description: "A new version of Abzar is ready.",
                action: {
                  label: "Refresh",
                  onClick: () => applyUpdate(),
                },
                duration: Infinity,
                id: "sw-update",
              });
            }
          });
        };

        registration.addEventListener("updatefound", onUpdateFound);

        // Check if there's already a waiting SW on load
        if (registration.waiting && navigator.serviceWorker.controller) {
          waitingSwRef.current = registration.waiting;
        }
      })
      .catch((err) => {
        console.error("SW registration failed:", err);
      });

    // Reload when new SW takes over
    let refreshing = false;
    const onControllerChange = () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      onControllerChange
    );

    return () => {
      clearInterval(updateInterval);
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        onControllerChange
      );
    };
  }, [applyUpdate]);

  // ── Install prompt capture ────────────────────────────────────────
  useEffect(() => {
    // Already installed as standalone — don't listen for install prompt
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const handler = (e: Event) => {
      e.preventDefault();
      deferredPromptRef.current = e as BeforeInstallPromptEvent;
      setIsInstallable(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  return (
    <PwaContext.Provider
      value={{
        isOffline,
        isInstallable,
        promptInstall,
        applyUpdate,
      }}
    >
      {children}
    </PwaContext.Provider>
  );
}
