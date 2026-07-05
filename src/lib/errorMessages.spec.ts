import { describe, it, expect } from "vitest";
import { getErrorMessage } from "./errorMessages";
import { ApiError } from "../api/client";

describe("getErrorMessage", () => {
  it("should extract message from standard Error", () => {
    const err = new Error("Standard error message");
    expect(getErrorMessage(err)).toBe("Standard error message");
  });

  it("should extract message from ApiError", () => {
    const err = new ApiError("API error message", 400, "BAD_REQUEST");
    expect(getErrorMessage(err)).toBe("API error message");
  });

  it("should return fallback message for unknown errors", () => {
    expect(getErrorMessage("just a string")).toBe("Unbekannter Fehler");
    expect(getErrorMessage(null)).toBe("Unbekannter Fehler");
    expect(getErrorMessage(undefined)).toBe("Unbekannter Fehler");
    expect(getErrorMessage({ foo: "bar" })).toBe("Unbekannter Fehler");
  });
});
