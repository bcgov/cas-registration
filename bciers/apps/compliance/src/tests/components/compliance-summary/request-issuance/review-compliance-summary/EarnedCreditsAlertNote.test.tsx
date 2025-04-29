import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, vi } from "vitest";
import { EarnedCreditsAlertNote } from "../../../../../app/components/compliance-summary/request-issuance/review-compliance-summary/EarnedCreditsAlertNote";

vi.mock("@bciers/components/icons", () => ({
  AlertIcon: (props: any) => (
    <div data-testid="alert-icon" {...props}>
      Alert Icon
    </div>
  ),
}));

describe("EarnedCreditsAlertNote", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the alert note with correct styling", () => {
    render(<EarnedCreditsAlertNote />);

    const paperElement = screen.getByTestId("earned-credits-alert-note");
    expect(paperElement).toHaveClass("p-[16px]");
    expect(paperElement).toHaveClass("mb-[10px]");
    expect(paperElement).toHaveClass("bg-[#DCE9F6]");
    expect(paperElement).toHaveClass("text-bc-text");
  });

  it("renders the AlertIcon", () => {
    render(<EarnedCreditsAlertNote />);

    const alertIcon = screen.getByTestId("alert-icon");
    expect(alertIcon).toBeInTheDocument();
    expect(alertIcon).toHaveAttribute("width", "40");
    expect(alertIcon).toHaveAttribute("height", "40");
  });

  it("displays the correct text content", () => {
    render(<EarnedCreditsAlertNote />);

    expect(
      screen.getByText(/The earned credits have not been issued yet/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/You may request issuance of them/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/as long as you have an active trading account/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Once issued, you may trade or use them to meet your compliance obligation/,
      ),
    ).toBeInTheDocument();
  });

  it("includes a link to the B.C. Carbon Registry with correct attributes", () => {
    render(<EarnedCreditsAlertNote />);

    const link = screen.getByText("B.C. Carbon Registrys");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "https://www.bc-ctr.ca/");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");

    expect(link).toHaveClass("text-bc-link-blue");
    expect(link).toHaveClass("underline");
    expect(link).toHaveClass("decoration-[1.2px]");
    expect(link).toHaveClass("font-bold");
  });
});
