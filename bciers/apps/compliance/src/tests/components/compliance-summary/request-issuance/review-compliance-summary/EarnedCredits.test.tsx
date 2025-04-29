import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, vi } from "vitest";
import { EarnedCredits } from "../../../../../app/components/compliance-summary/request-issuance/review-compliance-summary/EarnedCredits";

vi.mock("../../../../../app/components/compliance-summary/InfoRow", () => ({
  InfoRow: ({ label, value }: { label: string; value: string }) => (
    <div data-testid="info-row">
      <span
        data-testid={`info-row-label-${label.replace(/[^a-zA-Z0-9]/g, "-")}`}
      >
        {label}
      </span>
      <span
        data-testid={`info-row-value-${label.replace(/[^a-zA-Z0-9]/g, "-")}`}
      >
        {value}
      </span>
    </div>
  ),
}));

vi.mock("../../../../../app/components/compliance-summary/TitleRow", () => ({
  TitleRow: ({ label }: { label: string }) => (
    <div data-testid="title-row">{label}</div>
  ),
}));

vi.mock(
  "../../../../../app/components/compliance-summary/request-issuance/review-compliance-summary/EarnedCreditsAlertNote",
  () => ({
    EarnedCreditsAlertNote: () => (
      <div data-testid="earned-credits-alert-note">Alert Note Content</div>
    ),
  }),
);

describe("EarnedCredits", () => {
  const mockData = {
    earned_credits: "15",
    issuance_status: "Issuance not requested",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the title row with correct label", () => {
    render(<EarnedCredits data={mockData} />);

    const titleRow = screen.getByTestId("title-row");
    expect(titleRow).toBeInTheDocument();
    expect(titleRow).toHaveTextContent("Earned Credits");
  });

  it("renders the alert note", () => {
    render(<EarnedCredits data={mockData} />);

    const alertNote = screen.getByTestId("earned-credits-alert-note");
    expect(alertNote).toBeInTheDocument();
  });

  it("displays earned credits value correctly", () => {
    render(<EarnedCredits data={mockData} />);

    const earnedCreditsLabel = screen.getByTestId(
      "info-row-label-Earned-Credits-",
    );
    expect(earnedCreditsLabel).toBeInTheDocument();
    expect(earnedCreditsLabel).toHaveTextContent("Earned Credits:");

    const earnedCreditsValue = screen.getByTestId(
      "info-row-value-Earned-Credits-",
    );
    expect(earnedCreditsValue).toBeInTheDocument();
    expect(earnedCreditsValue).toHaveTextContent("15");
  });

  it("displays issuance status correctly", () => {
    render(<EarnedCredits data={mockData} />);

    const issuanceStatusLabel = screen.getByTestId(
      "info-row-label-Status-of-Issuance-",
    );
    expect(issuanceStatusLabel).toBeInTheDocument();
    expect(issuanceStatusLabel).toHaveTextContent("Status of Issuance:");

    const issuanceStatusValue = screen.getByTestId(
      "info-row-value-Status-of-Issuance-",
    );
    expect(issuanceStatusValue).toBeInTheDocument();
    expect(issuanceStatusValue).toHaveTextContent("Issuance not requested");
  });

  it("handles missing data gracefully", () => {
    const incompleteData = {
      earned_credits: undefined,
      issuance_status: undefined,
    };

    render(<EarnedCredits data={incompleteData} />);

    expect(screen.getByTestId("title-row")).toBeInTheDocument();

    const earnedCreditsValue = screen.getByTestId(
      "info-row-value-Earned-Credits-",
    );
    expect(earnedCreditsValue).toHaveTextContent("");

    const issuanceStatusValue = screen.getByTestId(
      "info-row-value-Status-of-Issuance-",
    );
    expect(issuanceStatusValue).toHaveTextContent("");
  });
});
