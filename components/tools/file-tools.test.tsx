import * as React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import MarkdownEditor from "./markdown-editor";
import PdfMerger from "./pdf-merger";
import ImageResizer from "./image-resizer";

function translate(template: string, values?: Record<string, string | number>) {
  if (!values) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ""));
}

const droppedFiles = vi.hoisted(() => ({ current: [] as File[] }));
const copyPagesMock = vi.hoisted(() => vi.fn(async (_src: unknown, indices: number[]) => indices.map((index) => ({ index }))));
const addPageMock = vi.hoisted(() => vi.fn());
const saveMock = vi.hoisted(() => vi.fn(async () => new Uint8Array([1, 2, 3])));

vi.mock("next-intl", () => ({
  useTranslations: (namespace: string) => {
    const namespaces: Record<string, Record<string, string>> = {
      markdownEditor: {
        copyHtml: "Copy HTML",
        export: "Export",
        clear: "Clear",
        markdown: "Markdown",
        preview: "Preview",
        placeholder: "Write Markdown here...",
      },
      pdfMerger: {
        dropLabel: "Drop PDF files here or click to browse",
        filesSummary: "{count} files · {pages} pages total",
        pageCount: "{count} pages",
        merging: "Merging...",
        mergeButton: "Merge {count} PDFs",
        downloadMerged: "Download Merged PDF",
        clearAll: "Clear All",
        emptyState: "Add at least 2 PDF files to merge them into one.",
        loadError: "Failed to load {name}. Make sure it's a valid PDF.",
        mergeError: "Failed to merge PDFs.",
      },
      imageResizer: {
        dropLabel: "Drop an image here to get started",
        resize: "Resize",
        crop: "Crop",
        widthPx: "Width (px)",
        heightPx: "Height (px)",
        lockAspectRatio: "Lock aspect ratio",
        original: "Original ({w}x{h})",
        resized: "Resized ({w}x{h})",
        resizedWithSize: "Resized ({w}x{h}) - {size}KB",
        applyCrop: "Apply Crop",
        cropInstruction: "Draw a selection, then drag to move or pull handles to resize.",
        selectCropArea: "Select crop area",
        croppedResult: "Cropped result",
        croppedResultWithSize: "Cropped result ({w}x{h}) - {size}KB",
        download: "Download",
        clear: "Clear",
        x: "X",
        y: "Y",
        width: "Width",
        height: "Height",
      },
    };

    const source = namespaces[namespace] ?? {};
    return (key: string, values?: Record<string, string | number>) =>
      translate(source[key] ?? key, values);
  },
}));

vi.mock("marked", () => ({
  marked: vi.fn((input: string) => {
    if (input.includes("throw")) throw new Error("parse failed");
    return input;
  }),
}));

vi.mock("dompurify", () => ({
  default: {
    sanitize: vi.fn((html: string) =>
      html
        .replace(/ onerror="[^"]*"/g, "")
        .replace(/<script[^>]*>.*?<\/script>/g, "")
    ),
  },
}));

vi.mock("pdf-lib", () => ({
  PDFDocument: {
    load: vi.fn(async (buffer: ArrayBuffer) => {
      const text = new TextDecoder().decode(new Uint8Array(buffer));
      if (text.includes("invalid")) throw new Error("invalid pdf");
      const pageCount = text.includes("two-pages") ? 2 : 1;
      return {
        getPageCount: () => pageCount,
        getPageIndices: () => Array.from({ length: pageCount }, (_, index) => index),
      };
    }),
    create: vi.fn(async () => ({
      copyPages: copyPagesMock,
      addPage: addPageMock,
      save: saveMock,
    })),
  },
}));

vi.mock("@/components/ui/textarea", () => ({
  Textarea: (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea {...props} />,
}));

vi.mock("@/components/ui/input", () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock("@/components/ui/label", () => ({
  Label: ({ children, ...props }: React.HTMLAttributes<HTMLLabelElement>) => (
    <label {...props}>{children}</label>
  ),
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div {...props}>{children}</div>
  ),
}));

vi.mock("@/components/ui/copy-button", () => ({
  CopyButton: ({ value, label }: { value: string; label?: string }) => (
    <button type="button" data-value={value}>{label ?? "Copy"}</button>
  ),
}));

vi.mock("@/components/ui/download-button", () => ({
  DownloadButton: ({
    data,
    filename,
    mimeType,
    label,
  }: {
    data: string | Blob;
    filename: string;
    mimeType?: string;
    label?: string;
  }) => (
    <button
      type="button"
      data-testid="download-button"
      data-filename={filename}
      data-mime={mimeType}
      data-payload={typeof data === "string" ? data : `blob:${data.size}`}
    >
      {label ?? "Download"}
    </button>
  ),
}));

vi.mock("@/components/ui/input-output-layout", () => ({
  InputOutputLayout: ({
    inputLabel,
    outputLabel,
    input,
    output,
  }: {
    inputLabel: string;
    outputLabel: string;
    input: React.ReactNode;
    output: React.ReactNode;
  }) => (
    <div>
      <div>{inputLabel}</div>
      <div>{input}</div>
      <div>{outputLabel}</div>
      <div data-testid="preview-pane">{output}</div>
    </div>
  ),
}));

const TabsContext = React.createContext<((value: string) => void) | null>(null);

vi.mock("@/components/ui/tabs", () => ({
  Tabs: ({
    children,
    onValueChange,
  }: {
    children: React.ReactNode;
    value?: string;
    onValueChange?: (value: string) => void;
  }) => <TabsContext.Provider value={onValueChange ?? null}>{children}</TabsContext.Provider>,
  TabsList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsTrigger: ({
    children,
    value,
  }: {
    children: React.ReactNode;
    value: string;
  }) => {
    const onValueChange = React.useContext(TabsContext);
    return (
      <button type="button" onClick={() => onValueChange?.(value)}>
        {children}
      </button>
    );
  },
}));

vi.mock("@/components/ui/switch", () => ({
  Switch: ({
    checked,
    onCheckedChange,
  }: {
    checked: boolean;
    onCheckedChange?: (value: boolean) => void;
  }) => (
    <input
      aria-label="Lock aspect ratio"
      type="checkbox"
      checked={checked}
      onChange={(event) => onCheckedChange?.(event.target.checked)}
    />
  ),
}));

vi.mock("@/components/ui/file-drop-zone", () => ({
  FileDropZone: ({ onFiles, label }: { onFiles: (files: File[]) => void; label?: string }) => (
    <button type="button" onClick={() => onFiles(droppedFiles.current)}>
      {label ?? "Upload"}
    </button>
  ),
}));

function makeFile(name: string, body: string, type = "application/octet-stream") {
  const file = new File([body], name, { type });
  file.arrayBuffer = vi.fn(async () => new TextEncoder().encode(body).buffer);
  return file;
}

describe("MarkdownEditor", () => {
  it("sanitizes rendered HTML before injecting it into the preview", async () => {
    render(<MarkdownEditor />);

    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, {
      target: { value: '<img src="x" onerror="alert(1)"><script>alert(1)</script><p>safe</p>' },
    });

    await waitFor(() => {
      const preview = screen.getByTestId("preview-pane");
      expect(preview.innerHTML).toContain('<img src="x">');
      expect(preview.innerHTML).toContain("<p>safe</p>");
      expect(preview.innerHTML).not.toContain("onerror");
      expect(preview.innerHTML).not.toContain("<script");
    });
  });

  it("switches export mode to HTML and exports a full document", async () => {
    render(<MarkdownEditor />);

    fireEvent.click(screen.getByRole("button", { name: ".html" }));

    await waitFor(() => {
      expect(screen.getByTestId("download-button")).toHaveAttribute(
        "data-filename",
        "document.html"
      );
    });
    expect(screen.getByTestId("download-button")).toHaveAttribute(
      "data-mime",
      "text/html"
    );
    expect(screen.getByTestId("download-button").getAttribute("data-payload")).toContain(
      "<!DOCTYPE html>"
    );
  });

  it("clears both the source markdown and rendered preview", async () => {
    render(<MarkdownEditor />);

    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "hello" } });
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));

    await waitFor(() => {
      expect(screen.getByRole("textbox")).toHaveValue("");
      expect(screen.getByTestId("preview-pane").textContent).toBe("");
    });
  });
});

describe("PdfMerger", () => {
  beforeEach(() => {
    droppedFiles.current = [];
    copyPagesMock.mockClear();
    addPageMock.mockClear();
    saveMock.mockClear();
  });

  it("rejects invalid PDFs and shows a load error", async () => {
    droppedFiles.current = [makeFile("bad.pdf", "invalid", "application/pdf")];
    render(<PdfMerger />);

    fireEvent.click(screen.getByRole("button", { name: /Drop PDF files/i }));

    expect(
      await screen.findByText("Failed to load bad.pdf. Make sure it's a valid PDF.")
    ).toBeInTheDocument();
    expect(screen.queryByText("bad.pdf")).not.toBeInTheDocument();
  });

  it("reorders files, merges them, and exposes the merged download", async () => {
    droppedFiles.current = [
      makeFile("first.pdf", "one-page", "application/pdf"),
      makeFile("second.pdf", "two-pages", "application/pdf"),
    ];
    render(<PdfMerger />);

    fireEvent.click(screen.getByRole("button", { name: /Drop PDF files/i }));

    expect(await screen.findByText("first.pdf")).toBeInTheDocument();
    expect(screen.getByText("second.pdf")).toBeInTheDocument();
    expect(screen.getByText("2 files · 3 pages total")).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "↓" })[0]);
    fireEvent.click(screen.getByRole("button", { name: "Merge 2 PDFs" }));

    expect(await screen.findByText("Download Merged PDF")).toBeInTheDocument();
    expect(copyPagesMock).toHaveBeenCalledTimes(2);
    expect(addPageMock).toHaveBeenCalledTimes(3);
  });

  it("clears all staged PDFs and hides the merged output", async () => {
    droppedFiles.current = [
      makeFile("first.pdf", "one-page", "application/pdf"),
      makeFile("second.pdf", "two-pages", "application/pdf"),
    ];
    render(<PdfMerger />);

    fireEvent.click(screen.getByRole("button", { name: /Drop PDF files/i }));
    await screen.findByText("first.pdf");
    fireEvent.click(screen.getByRole("button", { name: "Merge 2 PDFs" }));
    await screen.findByText("Download Merged PDF");

    fireEvent.click(screen.getByRole("button", { name: "Clear All" }));

    expect(screen.queryByText("first.pdf")).not.toBeInTheDocument();
    expect(screen.queryByText("Download Merged PDF")).not.toBeInTheDocument();
  });
});

describe("ImageResizer", () => {
  const createObjectURL = vi.fn(() => "blob:image");
  const revokeObjectURL = vi.fn();

  beforeEach(() => {
    droppedFiles.current = [makeFile("photo.png", "image-data", "image/png")];
    createObjectURL.mockClear();
    revokeObjectURL.mockClear();
    vi.stubGlobal("URL", { createObjectURL, revokeObjectURL });

    class MockImage {
      onload: null | (() => void) = null;
      naturalWidth = 400;
      naturalHeight = 200;
      private _src = "";

      set src(value: string) {
        this._src = value;
        this.onload?.();
      }

      get src() {
        return this._src;
      }
    }

    vi.stubGlobal("Image", MockImage);

    Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
      configurable: true,
      value: vi.fn(() => ({
        drawImage: vi.fn(),
        fillRect: vi.fn(),
        clearRect: vi.fn(),
        strokeRect: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        stroke: vi.fn(),
      })),
    });
    Object.defineProperty(HTMLCanvasElement.prototype, "toBlob", {
      configurable: true,
      value: vi.fn((callback: (blob: Blob | null) => void) =>
        callback(new Blob(["image"], { type: "image/png" }))
      ),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads image dimensions and keeps aspect ratio when width changes", async () => {
    render(<ImageResizer />);
    fireEvent.click(screen.getByRole("button", { name: /Drop an image here/i }));

    await waitFor(() => {
      expect(screen.getAllByText("Original (400x200)").length).toBeGreaterThan(0);
    });

    const inputs = screen.getAllByRole("spinbutton");
    fireEvent.change(inputs[0], { target: { value: "200" } });

    expect(inputs[0]).toHaveValue(200);
    expect(inputs[1]).toHaveValue(100);
    expect(screen.getByTestId("download-button")).toHaveAttribute(
      "data-filename",
      "resized-photo.png"
    );
  });

  it("applies a crop and switches the download filename", async () => {
    render(<ImageResizer />);
    fireEvent.click(screen.getByRole("button", { name: /Drop an image here/i }));

    await waitFor(() => {
      expect(screen.getAllByText("Original (400x200)").length).toBeGreaterThan(0);
    });
    fireEvent.click(screen.getByRole("button", { name: "Crop" }));
    fireEvent.click(screen.getByRole("button", { name: "Apply Crop" }));

    await waitFor(() => {
      expect(screen.getByTestId("download-button")).toHaveAttribute(
        "data-filename",
        "cropped-photo.png"
      );
    });
  });

  it("clears the current image and revokes the object URL", async () => {
    render(<ImageResizer />);
    fireEvent.click(screen.getByRole("button", { name: /Drop an image here/i }));

    await waitFor(() => {
      expect(screen.getAllByText("Original (400x200)").length).toBeGreaterThan(0);
    });
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));

    expect(revokeObjectURL).toHaveBeenCalledWith("blob:image");
    expect(screen.getByRole("button", { name: /Drop an image here/i })).toBeInTheDocument();
  });
});
