import { describe, it, expect } from "vitest";
import {
  tools,
  getToolBySlug,
  getToolsByCategory,
  getFeaturedTools,
  getAllTools,
  getVisibleTools,
  isToolAccessible,
} from "./tools-registry";
import { categories } from "./categories";

describe("tools-registry", () => {
  it("every tool belongs to a valid category", () => {
    const categorySlugs = new Set(categories.map((c) => c.slug));
    for (const tool of tools) {
      expect(categorySlugs.has(tool.category)).toBe(true);
    }
  });

  it("has no duplicate slugs", () => {
    const slugs = tools.map((t) => t.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("getToolBySlug returns correct tool", () => {
    const tool = getToolBySlug("json-formatter");
    expect(tool).toBeDefined();
    expect(tool!.name).toBe("JSON Formatter & Validator");
  });

  it("getToolBySlug returns undefined for nonexistent slug", () => {
    expect(getToolBySlug("nonexistent")).toBeUndefined();
  });

  it("getToolsByCategory returns tools for the category", () => {
    const devTools = getToolsByCategory("developer");
    expect(devTools.length).toBeGreaterThan(0);
    for (const t of devTools) {
      expect(t.category).toBe("developer");
    }
  });

  it("getToolsByCategory returns an empty array for unknown categories", () => {
    expect(getToolsByCategory("missing")).toEqual([]);
  });

  it("getFeaturedTools returns only featured tools", () => {
    const featured = getFeaturedTools();
    expect(featured.length).toBe(10);
    for (const t of featured) {
      expect(t.status).toBe("featured");
    }
  });

  it("getAllTools returns all tools", () => {
    expect(getAllTools().length).toBe(tools.length);
  });

  it("getVisibleTools excludes deprecated", () => {
    const visible = getVisibleTools();
    for (const t of visible) {
      expect(t.status).not.toBe("deprecated");
    }
  });

  it("isToolAccessible returns true for live/featured/beta", () => {
    expect(isToolAccessible({ status: "live" } as typeof tools[0])).toBe(true);
    expect(isToolAccessible({ status: "featured" } as typeof tools[0])).toBe(true);
    expect(isToolAccessible({ status: "beta" } as typeof tools[0])).toBe(true);
    expect(isToolAccessible({ status: "planned" } as typeof tools[0])).toBe(false);
    expect(isToolAccessible({ status: "deprecated" } as typeof tools[0])).toBe(false);
  });

  it("visible tools keep planned tools but exclude deprecated ones", () => {
    const visible = getVisibleTools();

    expect(visible.some((tool) => tool.status === "planned")).toBe(true);
    expect(visible.some((tool) => tool.status === "deprecated")).toBe(false);
  });

  it("related tools reference valid slugs", () => {
    const allSlugs = new Set(tools.map((t) => t.slug));
    for (const tool of tools) {
      if (tool.related) {
        for (const relSlug of tool.related) {
          expect(allSlugs.has(relSlug)).toBe(true);
        }
      }
    }
  });
});
