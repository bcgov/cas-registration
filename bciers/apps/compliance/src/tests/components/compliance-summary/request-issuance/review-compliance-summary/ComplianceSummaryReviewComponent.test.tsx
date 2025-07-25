import { render, screen, fireEvent, within } from "@testing-library/react";
import ComplianceSummaryReviewComponent from "@/compliance/src/app/components/compliance-summary/request-issuance/review-compliance-summary/ComplianceSummaryReviewComponent";
import { useSessionRole } from "@bciers/utils/src/sessionUtils";
import { IssuanceStatus, AnalystSuggestion } from "@bciers/utils/src/enums";

// Mock useSessionRole
vi.mock("@bciers/utils/src/sessionUtils", () => ({
  useSessionRole: vi.fn(),
}));

// Mock the router
const mockRouterPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
}));

const mockComplianceReportVersionId = 123;
const mockData = {
  reporting_year: 2024,
  excess_emissions: -15.0,
  emissions_limit: 100.0,
  emissions_attributable_for_compliance: 85.0,
  earned_credits_amount: 15,
  issuance_status: IssuanceStatus.CREDITS_NOT_ISSUED,
  bccr_trading_name: "Test Trading Name",
  bccr_holding_account_id: "123456789012345",
  analyst_suggestion: AnalystSuggestion.READY_TO_APPROVE,
  analyst_comment: "Test analyst comment",
  director_comment: "Test director comment",
  analyst_submitted_date: "2024-01-01",
  analyst_submitted_by: "Test Analyst",
  director_submitted_date: "2024-01-01",
  director_submitted_by: "Test Director",
};

describe("ComplianceSummaryReviewComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useSessionRole as any).mockReturnValue("industry_user");
  });

  it("renders the form with correct schema fields and headers", () => {
    render(
      <ComplianceSummaryReviewComponent
        complianceReportVersionId={mockComplianceReportVersionId}
        data={mockData}
      />,
    );

    // Check form title
    expect(screen.getByText("Review 2024 Compliance Summary")).toBeVisible();

    // Check Summary section
    expect(screen.getByText("From 2024 Report")).toBeVisible();
    expect(
      screen.getByText("Emissions Attributable for Compliance:"),
    ).toBeVisible();
    expect(screen.getByText("85")).toBeVisible();
    expect(screen.getAllByText("tCO2e")[0]).toBeVisible();
    expect(screen.getByText("Emissions Limit:")).toBeVisible();
    expect(screen.getByText(100.0)).toBeVisible();
    expect(screen.getAllByText("tCO2e")[1]).toBeVisible();
    expect(screen.getByText("Excess Emissions:")).toBeVisible();
    expect(screen.getByText(-15.0)).toBeVisible();
    expect(screen.getAllByText("tCO2e")[2]).toBeVisible();

    // Check Earned Credits section
    expect(screen.getByText("Earned Credits")).toBeVisible();
    expect(screen.getByText("Earned Credits:")).toBeVisible();
    expect(screen.getByText("15")).toBeVisible();
    expect(screen.getByText("Status of Issuance:")).toBeVisible();
    expect(screen.getByText("Issuance not requested")).toBeVisible();

    // Check alert note
    const alertNote = screen.getByRole("alert");
    expect(alertNote).toBeVisible();
    expect(alertNote).toHaveTextContent(
      "The earned credits have not been issued yet. You may request issuance of them as long as you have an active trading account in the B.C. Carbon Registry (BCCR). Once issued, you may trade or use them to meet your compliance obligation.",
    );
    const bccrLink = within(alertNote).getByRole("link", {
      name: "B.C. Carbon Registry",
    });
    expect(bccrLink).toBeVisible();
    expect(bccrLink).toHaveAttribute(
      "href",
      "https://carbonregistry.gov.bc.ca/bccarbonregistry",
    );
    expect(bccrLink).toHaveAttribute("target", "_blank");
    expect(bccrLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders navigation buttons with correct functionality", () => {
    render(
      <ComplianceSummaryReviewComponent
        complianceReportVersionId={mockComplianceReportVersionId}
        data={mockData}
      />,
    );

    const backButton = screen.getByRole("button", { name: "Back" });
    expect(backButton).toBeVisible();
    expect(backButton).not.toBeDisabled();

    const continueButton = screen.getByRole("button", { name: "Continue" });
    expect(continueButton).toBeVisible();
    expect(continueButton).not.toBeDisabled();

    fireEvent.click(backButton);
    expect(mockRouterPush).toHaveBeenCalledWith("/compliance-summaries");

    fireEvent.click(continueButton);
    expect(mockRouterPush).toHaveBeenCalledWith(
      `/compliance-summaries/${mockComplianceReportVersionId}/request-issuance-of-earned-credits`,
    );
  });

  it("does not render EarnedCreditsAlertNote for internal users", () => {
    (useSessionRole as any).mockReturnValue("cas_analyst");

    render(
      <ComplianceSummaryReviewComponent
        complianceReportVersionId={mockComplianceReportVersionId}
        data={mockData}
      />,
    );

    const alertNote = screen.queryByRole("alert");
    expect(alertNote).toBeNull();
  });

  it("navigates to request-issuance-of-earned-credits for industry users", () => {
    (useSessionRole as any).mockReturnValue("industry_user");

    render(
      <ComplianceSummaryReviewComponent
        complianceReportVersionId={mockComplianceReportVersionId}
        data={mockData}
      />,
    );

    const continueButton = screen.getByRole("button", { name: "Continue" });
    fireEvent.click(continueButton);

    expect(mockRouterPush).toHaveBeenCalledWith(
      `/compliance-summaries/${mockComplianceReportVersionId}/request-issuance-of-earned-credits`,
    );
  });

  it("navigates to review-credits-issuance-request for CAS staff", () => {
    (useSessionRole as any).mockReturnValue("cas_analyst");

    render(
      <ComplianceSummaryReviewComponent
        complianceReportVersionId={mockComplianceReportVersionId}
        data={mockData}
      />,
    );

    const continueButton = screen.getByRole("button", { name: "Continue" });
    fireEvent.click(continueButton);

    expect(mockRouterPush).toHaveBeenCalledWith(
      `/compliance-summaries/${mockComplianceReportVersionId}/review-credits-issuance-request`,
    );
  });
});
