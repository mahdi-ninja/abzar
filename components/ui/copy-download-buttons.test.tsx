import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CopyButton } from "./copy-button";
import { DownloadButton } from "./download-button";

const toast = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const labels: Record<string, string> = {
      copiedToClipboard: "Copied to clipboard",
      copyFailed: "Copy failed",
      copied: "Copied",
      copy: "Copy",
      download: "Download",
    };
    return labels[key] ?? key;
  },
}));

vi.mock("sonner", () => ({ toast }));

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("CopyButton", () => {
  it("copies text and resets its temporary copied state", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    let scheduledReset: (() => void) | undefined;
    vi.spyOn(globalThis, "setTimeout").mockImplementation((((callback: TimerHandler) => {
      scheduledReset = callback as () => void;
      return 0 as unknown as ReturnType<typeof setTimeout>;
    }) as unknown) as typeof setTimeout);
    Object.defineProperty(window.navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    render(<CopyButton value="hello" />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copy" }));
      await Promise.resolve();
    });

    expect(writeText).toHaveBeenCalledWith("hello");
    expect(toast.success).toHaveBeenCalledWith("Copied to clipboard");
    expect(screen.getByRole("button", { name: "Copied" })).toBeInTheDocument();

    await act(async () => {
      scheduledReset?.();
    });

    expect(screen.getByRole("button", { name: "Copy" })).toBeInTheDocument();
  });

  it("shows an error toast when clipboard access fails", async () => {
    Object.defineProperty(window.navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(new Error("denied")) },
    });

    render(<CopyButton value="hello" />);
    fireEvent.click(screen.getByRole("button", { name: "Copy" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Copy failed");
    });
  });
});

describe("DownloadButton", () => {
  it("downloads string data via an object URL", () => {
    const createObjectURL = vi.fn(() => "blob:download");
    const revokeObjectURL = vi.fn();
    const click = vi.fn();
    const appendChild = vi.spyOn(document.body, "appendChild");
    const removeChild = vi.spyOn(document.body, "removeChild");
    const originalCreateElement = document.createElement.bind(document);
    vi.stubGlobal("URL", {
      createObjectURL,
      revokeObjectURL,
    });
    vi.spyOn(document, "createElement").mockImplementation(((tagName: string) => {
      if (tagName === "a") {
        const anchor = originalCreateElement("a");
        anchor.click = click;
        return anchor;
      }
      return originalCreateElement(tagName);
    }) as typeof document.createElement);

    render(<DownloadButton data="hello" filename="test.txt" mimeType="text/plain" />);
    fireEvent.click(screen.getByRole("button", { name: "Download" }));

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(click).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:download");
    expect(appendChild).toHaveBeenCalled();
    expect(removeChild).toHaveBeenCalled();
  });

  it("uses a provided blob directly for downloads", () => {
    const createObjectURL = vi.fn(() => "blob:file");
    const revokeObjectURL = vi.fn();
    const click = vi.fn();
    const originalCreateElement = document.createElement.bind(document);
    vi.stubGlobal("URL", {
      createObjectURL,
      revokeObjectURL,
    });
    vi.spyOn(document, "createElement").mockImplementation(((tagName: string) => {
      if (tagName === "a") {
        const anchor = originalCreateElement("a");
        anchor.click = click;
        return anchor;
      }
      return originalCreateElement(tagName);
    }) as typeof document.createElement);

    const blob = new Blob(["pdf"], { type: "application/pdf" });
    render(<DownloadButton data={blob} filename="test.pdf" />);
    fireEvent.click(screen.getByRole("button", { name: "Download" }));

    expect(createObjectURL).toHaveBeenCalledWith(blob);
    expect(click).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:file");
  });
});
