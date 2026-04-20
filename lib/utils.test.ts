import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("resolves conflicting Tailwind classes", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });

  it("keeps clsx-style conditional merging intact", () => {
    expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
  });
});
