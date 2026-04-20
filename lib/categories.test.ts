import { describe, it, expect } from "vitest";
import { categories, getCategoryBySlug } from "./categories";

describe("categories", () => {
  it("has no duplicate slugs", () => {
    const slugs = categories.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("getCategoryBySlug works", () => {
    const cat = getCategoryBySlug("developer");
    expect(cat).toBeDefined();
    expect(cat!.name).toBe("Developer Tools");
  });

  it("getCategoryBySlug returns undefined for invalid slug", () => {
    expect(getCategoryBySlug("nonexistent")).toBeUndefined();
  });
});
