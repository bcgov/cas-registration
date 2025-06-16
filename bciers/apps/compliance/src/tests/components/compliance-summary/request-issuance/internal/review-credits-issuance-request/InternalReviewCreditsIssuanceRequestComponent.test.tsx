import { render, screen, fireEvent } from "@testing-library/react";
import InternalReviewCreditsIssuanceRequestComponent from "@/compliance/src/app/components/compliance-summary/request-issuance/internal/review-credits-issuance-request/InternalReviewCreditsIssuanceRequestComponent";

// Mock the router
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("InternalReviewCreditsIssuanceRequestComponent", () => {
  const mockFormData = {
    id: "123",
    reporting_year: 2023,
    earned_credits_amount: 100,
    issuance_status: "approved",
    bccr_trading_name: "Test Company",
    holding_account_id: "123456789012345",
    analyst_comment: "Test comment",
    submited_by: "Test User",
    submited_at: "2023-01-01",
    analyst_recommendation: "ready_to_approve",
  };
  const mockComplianceSummaryId = "123";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders form fields, section headers, and navigation buttons", () => {
    render(
      <InternalReviewCreditsIssuanceRequestComponent
        formData={mockFormData}
        complianceSummaryId={mockComplianceSummaryId}
      />,
    );

    // Check form title
    expect(screen.getByText("Review Credits Issuance Request")).toBeVisible();

    // Check section headers
    expect(screen.getByText("Earned Credits")).toBeVisible();
    expect(screen.getByText("Review by Analyst")).toBeVisible();

    // Check field labels
    expect(screen.getByText("Earned Credits:")).toBeVisible();
    expect(screen.getByText("Status of Issuance:")).toBeVisible();
    expect(screen.getByText("BCCR Trading Name:")).toBeVisible();
    expect(screen.getByText("BCCR Holding Account ID:")).toBeVisible();
    expect(screen.getByText("Analyst's Suggestion:")).toBeVisible();
    expect(screen.getByText("Analyst's Comment:")).toBeVisible();

    // Check navigation buttons
    expect(screen.getByRole("button", { name: "Back" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Continue" })).toBeVisible();
  });

  it("handles navigation buttons with correct states", () => {
    render(
      <InternalReviewCreditsIssuanceRequestComponent
        formData={mockFormData}
        complianceSummaryId={mockComplianceSummaryId}
      />,
    );

    // Check button states
    const backButton = screen.getByRole("button", { name: "Back" });
    const continueButton = screen.getByRole("button", { name: "Continue" });

    expect(backButton).toBeVisible();
    expect(continueButton).toBeVisible();

    // Test back button navigation
    fireEvent.click(backButton);
    expect(mockPush).toHaveBeenCalledWith(
      `/compliance-summaries/${mockComplianceSummaryId}/review-compliance-summary`,
    );

    // Test continue button navigation
    fireEvent.click(continueButton);
    expect(mockPush).toHaveBeenCalledWith(
      `/compliance-summaries/${mockComplianceSummaryId}/review-by-director`,
    );
  });
});
