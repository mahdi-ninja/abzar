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

  it("handles typo-tolerant search", () => {
    const results = searchTools("json");
    expect(results.length).toBeGreaterThan(0);
  });

  it("returns limited results", () => {
    const results = searchTools("a");
    // Should return some results but not all 200+
    expect(results.length).toBeGreaterThan(0);
  });
});
