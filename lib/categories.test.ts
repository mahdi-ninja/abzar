import { describe, it, expect } from "vitest";
import { categories, getCategoryBySlug } from "./categories";

describe("categories", () => {
  it("has 14 categories", () => {
    expect(categories.length).toBe(14);
  });

  it("every category has required fields", () => {
    for (const cat of categories) {
      expect(cat.slug).toBeTruthy();
      expect(cat.name).toBeTruthy();
      expect(cat.icon).toBeTruthy();
      expect(cat.color).toBeTruthy();
      expect(cat.description).toBeTruthy();
    }
  });

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
