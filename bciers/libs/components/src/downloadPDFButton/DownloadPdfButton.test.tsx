import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import DownloadPdfButton from "./DownloadPdfButton";

describe("DownloadPdfButton", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the default label and description", () => {
    render(<DownloadPdfButton />);

    const button = screen.getByRole("button");
    expect(button).toBeVisible();
    expect(button).toHaveTextContent("Save as PDF");

    // description contains the browser print hint
    expect(screen.getByText(/Or use your browser/i)).toBeInTheDocument();
  });

  it("renders a custom label and description when provided", () => {
    render(
      <DownloadPdfButton
        label="Print"
        description="Click to open the print dialog"
      />,
    );

    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("Print");
    expect(screen.getByText("Click to open the print dialog")).toBeVisible();
  });

  it("calls window.print when the button is clicked", () => {
    const printMock = vi.fn();
    Object.defineProperty(window, "print", {
      value: printMock,
      configurable: true,
    });

    render(<DownloadPdfButton />);
    const button = screen.getByRole("button");

    act(() => {
      button.click();
    });

    expect(printMock).toHaveBeenCalled();
  });
});
