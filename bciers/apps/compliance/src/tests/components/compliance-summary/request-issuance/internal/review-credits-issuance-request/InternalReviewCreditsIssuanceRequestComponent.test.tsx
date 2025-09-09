import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import InternalReviewCreditsIssuanceRequestComponent from "@/compliance/src/app/components/compliance-summary/request-issuance/internal/review-credits-issuance-request/InternalReviewCreditsIssuanceRequestComponent";
import { IssuanceStatus, AnalystSuggestion } from "@bciers/utils/src/enums";
import { useSessionRole } from "@bciers/utils/src/sessionUtils";
import { actionHandler } from "@bciers/actions";

// Mock useSessionRole
vi.mock("@bciers/utils/src/sessionUtils", () => ({
  useSessionRole: vi.fn(),
}));

// Mock the router
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock actionHandler
vi.mock("@bciers/actions", () => ({
  actionHandler: vi.fn(),
}));

describe("InternalReviewCreditsIssuanceRequestComponent", () => {
  const mockFormData = {
    reporting_year: 2023,
    emissions_attributable_for_compliance: 85,
    emissions_limit: 100,
    excess_emissions: -15,
    earned_credits_amount: 100,
    issuance_status: IssuanceStatus.APPROVED,
    bccr_trading_name: "Test Company",
    bccr_holding_account_id: "123456789012345",
    analyst_comment: "Test comment",
    director_comment: "Director comment",
    analyst_submitted_by: "Test User",
    analyst_submitted_date: "2023-01-01",
    analyst_suggestion: AnalystSuggestion.READY_TO_APPROVE,
  };
  const mockComplianceReportVersionId = 123;

  beforeEach(() => {
    vi.clearAllMocks();
    (useSessionRole as any).mockReturnValue("cas_analyst");
    (actionHandler as any).mockResolvedValue({ error: null });
  });

  it("renders form with correct title, section headers, and field labels for CAS Analyst", () => {
    render(
      <InternalReviewCreditsIssuanceRequestComponent
        initialFormData={mockFormData}
        complianceReportVersionId={mockComplianceReportVersionId}
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

    // Check field values
    expect(screen.getByText("100")).toBeVisible();
    expect(screen.getByText("Approved, credits issued in BCCR")).toBeVisible();
    expect(screen.getByText("Test Company")).toBeVisible();
    expect(screen.getByText("123456789012345")).toBeVisible();
    expect(screen.getByText("Ready to approve")).toBeVisible();
    expect(screen.getByText("Test comment")).toBeVisible();

    // Check submission info
    expect(
      screen.getByText("Submitted by Test User on January 1, 2023"),
    ).toBeVisible();

    // Check navigation buttons
    expect(screen.getByRole("button", { name: "Back" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Continue" })).toBeVisible();
  });

  it("check non cas analyst can't edit the analyst suggestion and comment", () => {
    (useSessionRole as any).mockReturnValue("cas_director");

    render(
      <InternalReviewCreditsIssuanceRequestComponent
        initialFormData={mockFormData}
        complianceReportVersionId={mockComplianceReportVersionId}
      />,
    );

    // check there is no radio button for analyst suggestion
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();

    // check there is no text area for analyst comment
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("handles form submission for CAS Analyst", async () => {
    render(
      <InternalReviewCreditsIssuanceRequestComponent
        initialFormData={mockFormData}
        complianceReportVersionId={mockComplianceReportVersionId}
      />,
    );

    const submitButton = screen.getByRole("button", { name: "Continue" });
    expect(submitButton).not.toBeDisabled();

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(actionHandler).toHaveBeenCalledWith(
        "compliance/compliance-report-versions/123/earned-credits",
        "PUT",
        "/compliance-summaries/123/review-by-director",
        {
          body: JSON.stringify({
            analyst_suggestion: AnalystSuggestion.READY_TO_APPROVE,
            analyst_comment: "Test comment",
          }),
        },
      );
    });

    expect(mockPush).toHaveBeenCalledWith(
      `/compliance-summaries/${mockComplianceReportVersionId}/review-by-director`,
    );
  });

  it("redirects non-CAS Analyst without submitting", async () => {
    (useSessionRole as any).mockReturnValue("cas_director");

    render(
      <InternalReviewCreditsIssuanceRequestComponent
        initialFormData={mockFormData}
        complianceReportVersionId={mockComplianceReportVersionId}
      />,
    );

    const submitButton = screen.getByRole("button", { name: "Continue" });
    fireEvent.click(submitButton);

    expect(mockPush).toHaveBeenCalledWith(
      `/compliance-summaries/${mockComplianceReportVersionId}/review-by-director`,
    );
    expect(actionHandler).not.toHaveBeenCalled();
  });

  it("disables submit button when analyst suggestion is missing", () => {
    const formDataWithoutSuggestion = {
      ...mockFormData,
      analyst_suggestion: undefined as any,
    };

    render(
      <InternalReviewCreditsIssuanceRequestComponent
        initialFormData={formDataWithoutSuggestion}
        complianceReportVersionId={mockComplianceReportVersionId}
      />,
    );

    const submitButton = screen.getByRole("button", { name: "Continue" });
    expect(submitButton).toBeDisabled();
  });

  it("handles submission errors", async () => {
    (actionHandler as any).mockResolvedValue({ error: "Submission failed" });

    render(
      <InternalReviewCreditsIssuanceRequestComponent
        initialFormData={mockFormData}
        complianceReportVersionId={mockComplianceReportVersionId}
      />,
    );

    const submitButton = screen.getByRole("button", { name: "Continue" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Submission failed")).toBeVisible();
    });

    expect(mockPush).not.toHaveBeenCalled();
    expect(submitButton).not.toBeDisabled();
  });

  it("handles back button navigation", () => {
    render(
      <InternalReviewCreditsIssuanceRequestComponent
        initialFormData={mockFormData}
        complianceReportVersionId={mockComplianceReportVersionId}
      />,
    );

    const backButton = screen.getByRole("button", { name: "Back" });
    fireEvent.click(backButton);

    expect(mockPush).toHaveBeenCalledWith(
      `/compliance-summaries/${mockComplianceReportVersionId}/request-issuance-review-summary`,
    );
  });

  it("displays submission info without analyst name when not provided", () => {
    const formDataWithoutAnalyst = {
      ...mockFormData,
      analyst_submitted_by: undefined as any,
    };

    render(
      <InternalReviewCreditsIssuanceRequestComponent
        initialFormData={formDataWithoutAnalyst}
        complianceReportVersionId={mockComplianceReportVersionId}
      />,
    );

    expect(screen.getByText("Submitted on January 1, 2023")).toBeVisible();
  });

  it("displays submission info without date when not provided", () => {
    const formDataWithoutDate = {
      ...mockFormData,
      analyst_submitted_date: undefined as any,
    };

    render(
      <InternalReviewCreditsIssuanceRequestComponent
        initialFormData={formDataWithoutDate}
        complianceReportVersionId={mockComplianceReportVersionId}
      />,
    );

    expect(screen.getByText("Submitted by Test User")).toBeVisible();
  });

  it("shows loading state and disables Continue while submitting; prevents repeated submit", async () => {
    render(
      <InternalReviewCreditsIssuanceRequestComponent
        initialFormData={mockFormData}
        complianceReportVersionId={mockComplianceReportVersionId}
      />,
    );

    const continueButton = screen.getByRole("button", { name: "Continue" });
    expect(continueButton).not.toBeDisabled();

    // First click triggers submission
    fireEvent.click(continueButton);

    // Wait until loading spinner is visible to ensure re-render happened
    await waitFor(() => {
      expect(screen.getByTestId("spinner")).toBeVisible();
    });

    // Further click on either button should be ignored
    fireEvent.click(continueButton);
    expect(actionHandler).toHaveBeenCalledTimes(1);
  });
});
