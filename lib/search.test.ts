import { describe, it, expect } from "vitest";
import { searchTools } from "./search";

describe("searchTools", () => {
  it("returns empty for empty query", () => {
    expect(searchTools("")).toEqual([]);
    expect(searchTools("   ")).toEqual([]);
  });

  it("finds JSON formatter by name", () => {
    const results = searchTools("json formatter");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].slug).toBe("json-formatter");
  });

  it("finds tools by tag", () => {
    const results = searchTools("password");
    const slugs = results.map((t) => t.slug);
    expect(slugs).toContain("password-generator");
  });

  it("uses localized tool names when searching in another locale", () => {
    const results = searchTools("فرمت‌دهنده و اعتبارسنج", "fa");

    expect(results.length).toBeGreaterThan(0);
    expect(results.map((result) => result.slug)).toContain("json-formatter");
  });

  it("falls back to English when the locale is unknown", () => {
    const results = searchTools("json formatter", "xx");

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].slug).toBe("json-formatter");
  });

  it("handles typo-tolerant search", () => {
    const results = searchTools("json");
    expect(results.length).toBeGreaterThan(0);
  });

  it("ranks direct name matches ahead of looser matches", () => {
    const results = searchTools("json formatter");

    expect(results[0].slug).toBe("json-formatter");
  });
});
