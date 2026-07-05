import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DiceButton } from "./DiceButton";

describe("DiceButton component", () => {
  it("should render button with correct text", () => {
    render(<DiceButton onClick={() => {}} />);
    const btn = screen.getByRole("button", { name: /WÜRFEL WERFEN/i });
    expect(btn).toBeInTheDocument();
    expect(btn).not.toHaveClass("animate-pulse");
  });

  it("should trigger onClick on click", () => {
    const onClickSpy = vi.fn();
    render(<DiceButton onClick={onClickSpy} />);
    const btn = screen.getByRole("button", { name: /WÜRFEL WERFEN/i });
    fireEvent.click(btn);
    expect(onClickSpy).toHaveBeenCalledTimes(1);
  });

  it("should be disabled when disabled prop is true", () => {
    const onClickSpy = vi.fn();
    render(<DiceButton onClick={onClickSpy} disabled={true} />);
    const btn = screen.getByRole("button", { name: /WÜRFEL WERFEN/i });
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    expect(onClickSpy).not.toHaveBeenCalled();
  });

  it("should have pulse animation styles when shouldPulse is true", () => {
    render(<DiceButton onClick={() => {}} shouldPulse={true} />);
    const btn = screen.getByRole("button", { name: /WÜRFEL WERFEN/i });
    expect(btn).toHaveClass("animate-pulse");
  });
});
