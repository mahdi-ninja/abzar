import { describe, it, expect } from "vitest";
import { generateToolJsonLd } from "./json-ld";
import type { Tool } from "./tools-registry";

describe("generateToolJsonLd", () => {
  const mockTool: Tool = {
    slug: "test-tool",
    name: "Test Tool",
    description: "A test tool",
    category: "developer",
    tags: ["test", "example"],
    status: "live",
  };

  it("generates valid schema.org WebApplication", () => {
    const ld = generateToolJsonLd(mockTool);
    expect(ld["@context"]).toBe("https://schema.org");
    expect(ld["@type"]).toBe("WebApplication");
    expect(ld.name).toBe("Test Tool");
    expect(ld.description).toBe("A test tool");
    expect(ld.url).toContain("/tools/developer/test-tool");
    expect(ld.applicationCategory).toBe("UtilityApplication");
    expect(ld.isAccessibleForFree).toBe(true);
    expect(ld.offers.price).toBe("0");
    expect(ld.featureList).toBe("test, example");
  });
});
