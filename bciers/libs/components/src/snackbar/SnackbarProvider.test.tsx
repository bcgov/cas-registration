import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SnackbarProvider, useSnackbar } from "@bciers/components/snackbar";

const Trigger = ({
  message,
  autoHideDuration,
}: {
  message: string;
  autoHideDuration?: number;
}) => {
  const { showSnackbar } = useSnackbar();
  return (
    <button onClick={() => showSnackbar(message, { autoHideDuration })}>
      {`show ${message}`}
    </button>
  );
};

describe("SnackbarProvider", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows the message passed to showSnackbar", () => {
    render(
      <SnackbarProvider>
        <Trigger message="Saved" />
      </SnackbarProvider>,
    );
    expect(screen.queryByText("Saved")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "show Saved" }));

    expect(screen.getByText("Saved")).toBeVisible();
  });

  it("keeps the message after the component that triggered it unmounts", () => {
    const { rerender } = render(
      <SnackbarProvider>
        <Trigger message="Saved" />
      </SnackbarProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "show Saved" }));

    rerender(<SnackbarProvider>{null}</SnackbarProvider>);

    expect(screen.getByText("Saved")).toBeVisible();
  });

  it("does not close on a click elsewhere on the page", async () => {
    render(
      <SnackbarProvider>
        <Trigger message="Saved" />
        <button>elsewhere</button>
      </SnackbarProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "show Saved" }));
    // MUI only starts listening for clickaway after the snackbar has mounted
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)));

    fireEvent.click(screen.getByRole("button", { name: "elsewhere" }));

    expect(screen.getByText("Saved")).toBeVisible();
  });

  it("hides the message after the auto-hide duration", () => {
    vi.useFakeTimers();
    render(
      <SnackbarProvider>
        <Trigger message="Saved" autoHideDuration={1000} />
      </SnackbarProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "show Saved" }));
    expect(screen.getByText("Saved")).toBeVisible();

    // Auto-hide duration, then the exit transition
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.queryByText("Saved")).not.toBeInTheDocument();
  });

  it("replaces the message when showSnackbar is called again", () => {
    render(
      <SnackbarProvider>
        <Trigger message="First" />
        <Trigger message="Second" />
      </SnackbarProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "show First" }));
    fireEvent.click(screen.getByRole("button", { name: "show Second" }));

    expect(screen.getByText("Second")).toBeVisible();
    expect(screen.queryByText("First")).not.toBeInTheDocument();
  });
});
