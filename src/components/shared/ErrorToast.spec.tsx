import { describe, it, expect, beforeEach, vi } from "vitest";
import { render } from "@testing-library/react";
import { ErrorToast } from "./ErrorToast";
import { useUIStore } from "@/stores/ui.store";
import { toast } from "sonner";

// Mock sonner toast functions
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock Toaster UI component
vi.mock("@/components/ui/sonner", () => ({
  Toaster: () => <div data-testid="mock-toaster" />,
}));

describe("ErrorToast component", () => {
  const removeToastSpy = vi.fn();

  beforeEach(() => {
    useUIStore.setState({
      toasts: [],
      removeToast: removeToastSpy,
    });
    vi.clearAllMocks();
  });

  it("should render Toaster container", () => {
    const { getByTestId } = render(<ErrorToast />);
    expect(getByTestId("mock-toaster")).toBeInTheDocument();
  });

  it("should trigger toast.error for error type toast and call removeToast", () => {
    useUIStore.setState({
      toasts: [
        {
          id: "toast-1",
          type: "error",
          title: "Failed action",
          message: "Unable to complete request",
        },
      ],
      removeToast: removeToastSpy,
    });

    render(<ErrorToast />);

    expect(toast.error).toHaveBeenCalledWith("Failed action", {
      description: "Unable to complete request",
      id: "toast-1",
    });
    expect(removeToastSpy).toHaveBeenCalledWith("toast-1");
  });

  it("should trigger toast.success for success type toast", () => {
    useUIStore.setState({
      toasts: [
        {
          id: "toast-2",
          type: "success",
          title: "Created",
          message: "Lobby created",
        },
      ],
      removeToast: removeToastSpy,
    });

    render(<ErrorToast />);

    expect(toast.success).toHaveBeenCalledWith("Created", {
      description: "Lobby created",
      id: "toast-2",
    });
    expect(removeToastSpy).toHaveBeenCalledWith("toast-2");
  });

  it("should trigger toast.warning for warning type toast", () => {
    useUIStore.setState({
      toasts: [
        {
          id: "toast-3",
          type: "warning",
          title: "Alert",
          message: "Action delayed",
        },
      ],
      removeToast: removeToastSpy,
    });

    render(<ErrorToast />);

    expect(toast.warning).toHaveBeenCalledWith("Alert", {
      description: "Action delayed",
      id: "toast-3",
    });
  });

  it("should trigger toast.info for default/info type toast", () => {
    useUIStore.setState({
      toasts: [
        {
          id: "toast-4",
          type: "info",
          title: "Notification",
          message: "Game will start soon",
        },
      ],
      removeToast: removeToastSpy,
    });

    render(<ErrorToast />);

    expect(toast.info).toHaveBeenCalledWith("Notification", {
      description: "Game will start soon",
      id: "toast-4",
    });
  });
});
