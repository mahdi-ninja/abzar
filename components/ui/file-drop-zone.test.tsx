import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FileDropZone } from "./file-drop-zone";

vi.mock("next-intl", () => ({
  useTranslations: () =>
    (key: string, values?: { size?: number }) => {
      if (key === "dropFiles") return "Drop files";
      if (key === "maxFileSize") return `Max ${values?.size} MB`;
      return key;
    },
}));

describe("FileDropZone", () => {
  it("accepts the first valid file in single-file mode", () => {
    const onFiles = vi.fn();
    render(<FileDropZone onFiles={onFiles} multiple={false} />);

    const fileA = new File(["a"], "a.txt", { type: "text/plain" });
    const fileB = new File(["b"], "b.txt", { type: "text/plain" });

    const actualInput = document.querySelector("input[type='file']");
    if (!(actualInput instanceof HTMLInputElement)) throw new Error("file input missing");

    fireEvent.change(actualInput, { target: { files: [fileA, fileB] } });

    expect(onFiles).toHaveBeenCalledWith([fileA]);
    expect(actualInput.files).toHaveLength(2);
  });

  it("filters oversized files and preserves multiple valid files", () => {
    const onFiles = vi.fn();
    render(<FileDropZone onFiles={onFiles} multiple maxSizeMB={1} />);

    const zone = screen.getByText("Drop files").closest("div");
    if (!zone) throw new Error("drop zone missing");

    const small = new File([new Uint8Array(100)], "small.txt", {
      type: "text/plain",
    });
    const big = new File([new Uint8Array(2 * 1024 * 1024)], "big.txt", {
      type: "text/plain",
    });

    fireEvent.drop(zone, {
      dataTransfer: { files: [small, big] },
    });

    expect(onFiles).toHaveBeenCalledWith([small]);
  });

  it("toggles drag styling on drag enter and leave", () => {
    render(<FileDropZone onFiles={vi.fn()} />);

    const zone = screen.getByText("Drop files").closest("div");
    if (!zone) throw new Error("drop zone missing");

    fireEvent.dragOver(zone);
    expect(zone.className).toContain("border-primary");

    fireEvent.dragLeave(zone);
    expect(zone.className).not.toContain("border-primary");
  });

  it("ignores drops when all files exceed the size limit", () => {
    const onFiles = vi.fn();
    render(<FileDropZone onFiles={onFiles} maxSizeMB={1} />);

    const zone = screen.getByText("Drop files").closest("div");
    if (!zone) throw new Error("drop zone missing");

    const big = new File([new Uint8Array(2 * 1024 * 1024)], "big.txt", {
      type: "text/plain",
    });

    fireEvent.drop(zone, {
      dataTransfer: { files: [big] },
    });

    expect(onFiles).not.toHaveBeenCalled();
  });
});
