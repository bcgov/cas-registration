import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi, afterEach } from "vitest";
import DownloadPdfButton from "./DownloadPdfButton";

describe("DownloadPdfButton", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the default label and description", () => {
    render(<DownloadPdfButton />);

    const button = screen.getByRole("button");
    expect(button).toBeVisible();
    expect(button).toHaveTextContent("Save as PDF");

    // description contains the browser print/savePDF hint
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
    // Spy instead of redefining window.print, so restoreAllMocks puts it back for later test files
    const printMock = vi.spyOn(window, "print").mockImplementation(() => {});

    render(<DownloadPdfButton />);
    const button = screen.getByRole("button");

    act(() => {
      button.click();
    });

    expect(printMock).toHaveBeenCalled();
  });
});
