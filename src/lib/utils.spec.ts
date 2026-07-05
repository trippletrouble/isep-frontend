import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn helper", () => {
  it("should merge tailwind classes correctly", () => {
    expect(cn("px-2 py-1", "p-4")).toBe("p-4");
  });

  it("should handle conditional classes", () => {
    expect(cn("bg-red-500", false && "text-white", true && "font-bold")).toBe(
      "bg-red-500 font-bold"
    );
  });

  it("should return empty string if no arguments are provided", () => {
    expect(cn()).toBe("");
  });
});
