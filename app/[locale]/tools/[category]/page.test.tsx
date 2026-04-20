import * as React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const notFoundMock = vi.hoisted(() => vi.fn(() => {
  throw new Error("NOT_FOUND");
}));

const setRequestLocaleMock = vi.hoisted(() => vi.fn());
const getTranslationsMock = vi.hoisted(() =>
  vi.fn(async ({ namespace }: { namespace: string }) => {
    const namespaces: Record<string, Record<string, string>> = {
      categories: {
        "text.name": "Text Tools",
        "text.description": "Text utilities",
      },
    };
    const source = namespaces[namespace] ?? {};
    return (key: string) => source[key] ?? `${namespace}.${key}`;
  })
);

vi.mock("next/navigation", () => ({
  notFound: notFoundMock,
}));

vi.mock("next-intl/server", () => ({
  getTranslations: getTranslationsMock,
  setRequestLocale: setRequestLocaleMock,
}));

vi.mock("next-intl", () => ({
  useTranslations: (namespace: string) => {
    const namespaces: Record<string, Record<string, string>> = {
      breadcrumbs: { home: "Home" },
      categoryPage: {
        betaBadge: "Beta",
        newBadge: "New",
        comingSoon: "Coming soon",
      },
      categories: {
        "text.name": "Text Tools",
        "text.description": "Text utilities",
      },
      tools: {
        "markdown-editor.name": "Markdown Editor",
        "markdown-editor.description": "Markdown preview tool",
        "text-diff.name": "Text Diff Tool",
        "text-diff.description": "Compare text changes",
      },
    };
    const source = namespaces[namespace] ?? {};
    return (key: string) => source[key] ?? `${namespace}.${key}`;
  },
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

const pageModule = await import("./page");

describe("category route page", () => {
  beforeEach(() => {
    notFoundMock.mockClear();
    setRequestLocaleMock.mockClear();
    getTranslationsMock.mockClear();
  });

  it("generates static params for all locales and categories", () => {
    const params = pageModule.generateStaticParams();

    expect(params).toContainEqual({ locale: "en", category: "text" });
    expect(params).toContainEqual({ locale: "es", category: "developer" });
  });

  it("generates localized metadata for valid categories", async () => {
    const metadata = await pageModule.generateMetadata({
      params: Promise.resolve({ locale: "en", category: "text" }),
    });

    expect(metadata.title).toBe("Text Tools");
    expect(metadata.description).toBe("Text utilities");
    expect(metadata.alternates?.languages?.fa).toBe("/fa/tools/text");
  });

  it("returns empty metadata for invalid categories", async () => {
    const metadata = await pageModule.generateMetadata({
      params: Promise.resolve({ locale: "en", category: "missing" }),
    });

    expect(metadata).toEqual({});
  });

  it("renders active tools as links and planned tools as non-links", async () => {
    const element = await pageModule.default({
      params: Promise.resolve({ locale: "en", category: "text" }),
    });

    render(element);

    expect(setRequestLocaleMock).toHaveBeenCalledWith("en");
    const activeTool = screen.getByText("Markdown Editor");
    expect(activeTool.closest("a")).toHaveAttribute(
      "href",
      "/tools/text/markdown-editor"
    );

    const plannedTool = screen.getByText("Text Diff Tool");
    expect(plannedTool.closest("a")).toBeNull();
    expect(screen.getByText("Coming soon")).toBeInTheDocument();
  });

  it("throws notFound for invalid categories", async () => {
    await expect(
      pageModule.default({
        params: Promise.resolve({ locale: "en", category: "missing" }),
      })
    ).rejects.toThrow("NOT_FOUND");
  });
});
