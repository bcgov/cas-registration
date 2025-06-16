import { render, screen, fireEvent } from "@testing-library/react";
import InternalReviewByDirectorComponent from "@/compliance/src/app/components/compliance-summary/request-issuance/internal/review-by-director/InternalReviewByDirectorComponent";

// Mock the router
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("InternalReviewByDirectorComponent", () => {
  const mockFormData = {
    id: "123",
    reporting_year: 2023,
    earned_credits_amount: 100,
    issuance_status: "approved",
    bccr_trading_name: "Test Trading Co",
    holding_account_id: "123456789012345",
    analyst_comment: "Analyst's review comment",
    analyst_recommendation: "ready_to_approve",
    director_comment: "",
  };

  const mockComplianceSummaryId = "123";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders form fields, section headers, and navigation buttons", () => {
    render(
      <InternalReviewByDirectorComponent
        formData={mockFormData}
        complianceSummaryId={mockComplianceSummaryId}
      />,
    );

    // Check section headers
    expect(screen.getByText("Earned Credits")).toBeVisible();
    expect(screen.getByText("Reviewed by Analyst")).toBeVisible();

    // Check field labels
    expect(screen.getByText("Earned Credits:")).toBeVisible();
    expect(screen.getByText("Status of Issuance:")).toBeVisible();
    expect(screen.getByText("BCCR Trading Name:")).toBeVisible();
    expect(screen.getByText("BCCR Holding Account ID:")).toBeVisible();
    expect(screen.getByText("Analyst's Comment:")).toBeVisible();
    expect(screen.getByText("Director's Comment:")).toBeVisible();

    // Check navigation buttons
    expect(screen.getByRole("button", { name: "Back" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Decline" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Approve" })).toBeVisible();
  });

  it("handles navigation and action buttons with correct states", () => {
    render(
      <InternalReviewByDirectorComponent
        formData={mockFormData}
        complianceSummaryId={mockComplianceSummaryId}
      />,
    );

    // Check button states
    const backButton = screen.getByRole("button", { name: "Back" });
    const declineButton = screen.getByRole("button", { name: "Decline" });
    const approveButton = screen.getByRole("button", { name: "Approve" });

    expect(backButton).toBeVisible();
    expect(declineButton).toBeVisible();
    expect(approveButton).toBeVisible();

    // Test back button navigation
    fireEvent.click(backButton);
    expect(mockPush).toHaveBeenCalledWith(
      `/compliance-summaries/${mockComplianceSummaryId}/review-credits-issuance-request`,
    );

    // Test approve button click (navigation not implemented yet)
    fireEvent.click(approveButton);

    // Test decline button click (navigation not implemented yet)
    fireEvent.click(declineButton);
  });
});
