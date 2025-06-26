import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import InternalTrackStatusOfIssuanceComponent from "@/compliance/src/app/components/compliance-summary/request-issuance/internal/track-status-of-issuance/InternalTrackStatusOfIssuanceComponent";
import { IssuanceStatus } from "@bciers/utils/src/enums";

vi.mock("@bciers/components/form/FormBase", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="form-base">{children}</div>
  ),
}));

vi.mock("@/compliance/src/app/components/ComplianceStepButtons", () => ({
  default: ({ backUrl }: { backUrl: string }) => (
    <div data-testid="compliance-buttons">{backUrl}</div>
  ),
}));

describe("InternalTrackStatusOfIssuanceComponent", () => {
  const mockComplianceSummaryId = "123";
  const mockData = {
    earned_credits: 100,
    issuance_status: IssuanceStatus.APPROVED,
    bccr_trading_name: "Test Trading Name",
    holding_account_id: "123456789",
    directors_comments: "Test comments",
    analysts_comments: "Analyst's comments",
  };

  it("renders with correct back URL", () => {
    render(
      <InternalTrackStatusOfIssuanceComponent
        data={mockData}
        complianceSummaryId={mockComplianceSummaryId}
      />,
    );

    // Check if the component renders with the correct back URL
    const buttons = screen.getByTestId("compliance-buttons");
    expect(buttons).toHaveTextContent(
      `/compliance-summaries/${mockComplianceSummaryId}/review-by-director`,
    );
  });

  it("renders FormBase with correct props", () => {
    render(
      <InternalTrackStatusOfIssuanceComponent
        data={mockData}
        complianceSummaryId={mockComplianceSummaryId}
      />,
    );

    // Check if FormBase is rendered
    expect(screen.getByTestId("form-base")).toBeVisible();
  });
});
