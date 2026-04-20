import * as React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const notFoundMock = vi.hoisted(() => vi.fn(() => {
  throw new Error("NOT_FOUND");
}));

const setRequestLocaleMock = vi.hoisted(() => vi.fn());
const getMessagesMock = vi.hoisted(() => vi.fn(async () => ({ locale: "en" })));
const getTranslationsMock = vi.hoisted(() =>
  vi.fn(async ({ namespace }: { namespace: string }) => {
    const namespaces: Record<string, Record<string, unknown>> = {
      tools: {
        "json-formatter.name": "Localized JSON Formatter",
        "json-formatter.description": "Localized JSON description",
        "text-diff.name": "Localized Text Diff",
        "text-diff.description": "Localized Text Diff description",
      },
      site: {
        titleSuffix: "Abzar",
        name: "Abzar",
      },
      toolPage: {
        comingSoonTitle: "Coming soon",
        comingSoonDesc: "This tool is not available yet.",
      },
      toolContent: {
        "json-formatter.about": "About JSON formatter",
        "json-formatter.howTo": ["Paste JSON", "Copy output"],
      },
    };

    const source = namespaces[namespace] ?? {};
    const translate = ((key: string) => source[key] ?? `${namespace}.${key}`) as ((
      key: string
    ) => unknown) & {
      has?: (key: string) => boolean;
      raw?: (key: string) => unknown;
    };

    translate.has = (key: string) => key in source;
    translate.raw = (key: string) => source[key];
    return translate;
  })
);

const toolPagePropsMock = vi.hoisted(() => vi.fn());

vi.mock("next/dynamic", () => ({
  default: () => function MockDynamicTool() {
    return <div data-testid="tool-component">tool component</div>;
  },
}));

vi.mock("next/navigation", () => ({
  notFound: notFoundMock,
}));

vi.mock("next-intl/server", () => ({
  getTranslations: getTranslationsMock,
  setRequestLocale: setRequestLocaleMock,
  getMessages: getMessagesMock,
}));

vi.mock("next-intl", () => ({
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/layout/tool-page", () => ({
  ToolPage: ({
    tool,
    toolName,
    toolDesc,
    about,
    howTo,
    children,
  }: {
    tool: { slug: string };
    toolName?: string;
    toolDesc?: string;
    about?: string;
    howTo?: string[];
    children: React.ReactNode;
  }) => {
    toolPagePropsMock({ tool, toolName, toolDesc, about, howTo });
    return (
      <div>
        <div data-testid="tool-slug">{tool.slug}</div>
        <div data-testid="tool-name">{toolName}</div>
        <div data-testid="tool-desc">{toolDesc}</div>
        <div data-testid="tool-about">{about}</div>
        <div data-testid="tool-howto">{howTo?.join(" | ")}</div>
        {children}
      </div>
    );
  },
}));

const pageModule = await import("./page");

describe("tool route page", () => {
  beforeEach(() => {
    notFoundMock.mockClear();
    setRequestLocaleMock.mockClear();
    getMessagesMock.mockClear();
    getTranslationsMock.mockClear();
    toolPagePropsMock.mockClear();
  });

  it("generates static params for localized tool pages", () => {
    const params = pageModule.generateStaticParams();

    expect(params).toContainEqual({
      locale: "en",
      category: "developer",
      "tool-slug": "json-formatter",
    });
    expect(params).toContainEqual({
      locale: "fa",
      category: "developer",
      "tool-slug": "json-formatter",
    });
  });

  it("generates localized metadata for a valid tool route", async () => {
    const metadata = await pageModule.generateMetadata({
      params: Promise.resolve({
        locale: "en",
        category: "developer",
        "tool-slug": "json-formatter",
      }),
    });

    expect(metadata.title).toBe("Localized JSON Formatter — Abzar");
    expect(metadata.description).toBe("Localized JSON description");
    expect(metadata.alternates?.languages?.fa).toBe(
      "/fa/tools/developer/json-formatter"
    );

    const jsonLd = JSON.parse(String(metadata.other?.["script:ld+json"]));
    expect(jsonLd.name).toBe("Localized JSON Formatter");
    expect(jsonLd.description).toBe("Localized JSON description");
    expect(jsonLd.url).toContain("/en/tools/developer/json-formatter");
  });

  it("returns empty metadata for a mismatched category", async () => {
    const metadata = await pageModule.generateMetadata({
      params: Promise.resolve({
        locale: "en",
        category: "text",
        "tool-slug": "json-formatter",
      }),
    });

    expect(metadata).toEqual({});
  });

  it("renders an accessible tool inside the tool page shell", async () => {
    const element = await pageModule.default({
      params: Promise.resolve({
        locale: "en",
        category: "developer",
        "tool-slug": "json-formatter",
      }),
    });

    render(element);

    expect(setRequestLocaleMock).toHaveBeenCalledWith("en");
    expect(getMessagesMock).toHaveBeenCalled();
    expect(screen.getByTestId("tool-slug")).toHaveTextContent("json-formatter");
    expect(screen.getByTestId("tool-name")).toHaveTextContent(
      "Localized JSON Formatter"
    );
    expect(screen.getByTestId("tool-about")).toHaveTextContent(
      "About JSON formatter"
    );
    expect(screen.getByTestId("tool-howto")).toHaveTextContent(
      "Paste JSON | Copy output"
    );
    expect(screen.getByTestId("tool-component")).toBeInTheDocument();
  });

  it("renders the coming soon fallback for inaccessible tools", async () => {
    const element = await pageModule.default({
      params: Promise.resolve({
        locale: "en",
        category: "text",
        "tool-slug": "text-diff",
      }),
    });

    render(element);

    expect(screen.getByText("Coming soon")).toBeInTheDocument();
    expect(screen.getByText("This tool is not available yet.")).toBeInTheDocument();
    expect(screen.queryByTestId("tool-component")).not.toBeInTheDocument();
  });

  it("throws notFound for an unknown tool slug", async () => {
    await expect(
      pageModule.default({
        params: Promise.resolve({
          locale: "en",
          category: "developer",
          "tool-slug": "missing-tool",
        }),
      })
    ).rejects.toThrow("NOT_FOUND");
  });

  it("throws notFound for a mismatched category", async () => {
    await expect(
      pageModule.default({
        params: Promise.resolve({
          locale: "en",
          category: "text",
          "tool-slug": "json-formatter",
        }),
      })
    ).rejects.toThrow("NOT_FOUND");
  });
});
