import * as React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const toast = vi.hoisted(() => ({
  success: vi.fn(),
  warning: vi.fn(),
  dismiss: vi.fn(),
  info: vi.fn(),
}));

vi.mock("sonner", () => ({ toast }));

function Consumer({ usePwa }: { usePwa: () => { isOffline: boolean; isInstallable: boolean; promptInstall: () => Promise<void>; applyUpdate: () => void; } }) {
  const pwa = usePwa();
  return (
    <div>
      <div data-testid="offline">{String(pwa.isOffline)}</div>
      <div data-testid="installable">{String(pwa.isInstallable)}</div>
      <button onClick={() => pwa.promptInstall()}>install</button>
      <button onClick={() => pwa.applyUpdate()}>apply-update</button>
    </div>
  );
}

describe("PwaProvider", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubEnv("NODE_ENV", "production");

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    });
  });

  it("tracks offline and online state transitions", async () => {
    const registration = {
      update: vi.fn(),
      waiting: null,
      installing: null,
      addEventListener: vi.fn(),
    };
    const serviceWorker = {
      controller: {},
      register: vi.fn().mockResolvedValue(registration),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    Object.defineProperty(window.navigator, "serviceWorker", {
      configurable: true,
      value: serviceWorker,
    });

    const { PwaProvider, usePwa } = await import("./pwa-provider");

    render(
      <PwaProvider>
        <Consumer usePwa={usePwa} />
      </PwaProvider>
    );

    expect(screen.getByTestId("offline")).toHaveTextContent("false");

    fireEvent(window, new Event("offline"));
    await waitFor(() => {
      expect(screen.getByTestId("offline")).toHaveTextContent("true");
    });
    expect(toast.warning).toHaveBeenCalledWith("You're offline", expect.any(Object));

    fireEvent(window, new Event("online"));
    await waitFor(() => {
      expect(screen.getByTestId("offline")).toHaveTextContent("false");
    });
    expect(toast.dismiss).toHaveBeenCalledWith("offline-status");
  });

  it("captures and resolves the install prompt", async () => {
    const registration = {
      update: vi.fn(),
      waiting: null,
      installing: null,
      addEventListener: vi.fn(),
    };
    const serviceWorker = {
      controller: {},
      register: vi.fn().mockResolvedValue(registration),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    Object.defineProperty(window.navigator, "serviceWorker", {
      configurable: true,
      value: serviceWorker,
    });

    const { PwaProvider, usePwa } = await import("./pwa-provider");

    render(
      <PwaProvider>
        <Consumer usePwa={usePwa} />
      </PwaProvider>
    );

    const prompt = vi.fn().mockResolvedValue(undefined);
    const event = new Event("beforeinstallprompt");
    Object.assign(event, {
      prompt,
      userChoice: Promise.resolve({ outcome: "accepted" }),
      preventDefault: vi.fn(),
    });

    fireEvent(window, event);
    await waitFor(() => {
      expect(screen.getByTestId("installable")).toHaveTextContent("true");
    });

    fireEvent.click(screen.getByText("install"));

    await waitFor(() => {
      expect(prompt).toHaveBeenCalled();
      expect(screen.getByTestId("installable")).toHaveTextContent("false");
    });
    expect(toast.success).toHaveBeenCalledWith("Abzar installed!");
  });

  it("surfaces waiting service workers and applies updates", async () => {
    const waiting = { postMessage: vi.fn() };
    const installingPostMessage = vi.fn();
    let stateChangeHandler: (() => void) | undefined;
    const installing = {
      state: "installing",
      postMessage: installingPostMessage,
      addEventListener: vi.fn((type: string, cb: () => void) => {
        if (type === "statechange") stateChangeHandler = cb;
      }),
    };
    let updateFoundHandler: (() => void) | undefined;
    let controllerChangeHandler: (() => void) | undefined;
    const registration = {
      update: vi.fn(),
      waiting,
      installing,
      addEventListener: vi.fn((type: string, cb: () => void) => {
        if (type === "updatefound") updateFoundHandler = cb;
      }),
    };
    const serviceWorker = {
      controller: {},
      register: vi.fn().mockResolvedValue(registration),
      addEventListener: vi.fn((type: string, cb: () => void) => {
        if (type === "controllerchange") controllerChangeHandler = cb;
      }),
      removeEventListener: vi.fn(),
    };
    Object.defineProperty(window.navigator, "serviceWorker", {
      configurable: true,
      value: serviceWorker,
    });

    const { PwaProvider, usePwa } = await import("./pwa-provider");

    render(
      <PwaProvider>
        <Consumer usePwa={usePwa} />
      </PwaProvider>
    );

    await waitFor(() => expect(serviceWorker.register).toHaveBeenCalledWith("/sw.js"));

    updateFoundHandler?.();
    installing.state = "installed";
    stateChangeHandler?.();

    expect(toast.info).toHaveBeenCalledWith(
      "Update available",
      expect.objectContaining({ id: "sw-update" })
    );

    fireEvent.click(screen.getByText("apply-update"));
    expect(installingPostMessage).toHaveBeenCalledWith({ type: "SKIP_WAITING" });
    expect(waiting.postMessage).not.toHaveBeenCalled();
    expect(controllerChangeHandler).toBeTypeOf("function");
  });
});
