import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import InternalReviewByDirectorComponent from "@/compliance/src/app/components/compliance-summary/request-issuance/internal/review-by-director/InternalReviewByDirectorComponent";
import { AnalystSuggestion, IssuanceStatus } from "@bciers/utils/src/enums";
import { useSessionRole } from "@bciers/utils/src/sessionUtils";
import { actionHandler } from "@bciers/actions";

// Mock the router
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock useSessionRole
vi.mock("@bciers/utils/src/sessionUtils", () => ({
  useSessionRole: vi.fn(),
}));

vi.mock("@bciers/actions", () => ({
  actionHandler: vi.fn(),
}));

describe("InternalReviewByDirectorComponent", () => {
  const mockData = {
    reporting_year: 2023,
    emissions_attributable_for_compliance: 85,
    emissions_limit: 100,
    excess_emissions: -15,
    earned_credits_amount: 100,
    issuance_status: IssuanceStatus.ISSUANCE_REQUESTED,
    bccr_trading_name: "Test Trading Co",
    bccr_holding_account_id: "123456789012345",
    analyst_comment: "Analyst's review comment",
    director_comment: "",
    analyst_submitted_date: "2024-01-15",
    analyst_submitted_by: "Test Analyst",
    analyst_suggestion: AnalystSuggestion.READY_TO_APPROVE,
  };

  const mockComplianceReportVersionId = 123;

  beforeEach(() => {
    vi.clearAllMocks();
    (useSessionRole as any).mockReturnValue("cas_director");
    (actionHandler as any).mockResolvedValue({ error: null });
  });

  it("renders form fields, section headers, and navigation buttons for director", () => {
    render(
      <InternalReviewByDirectorComponent
        data={mockData}
        complianceReportVersionId={mockComplianceReportVersionId}
      />,
    );

    expect(screen.getByText("Earned Credits")).toBeVisible();
    expect(screen.getByText("Reviewed by Analyst")).toBeVisible();
    expect(screen.queryAllByText("Review by Director")).toHaveLength(2); // one for the page title and one for the input label
    expect(screen.getByText("Earned Credits:")).toBeVisible();
    expect(screen.getByText("Status of Issuance:")).toBeVisible();
    expect(screen.getByText("BCCR Trading Name:")).toBeVisible();
    expect(screen.getByText("BCCR Holding Account ID:")).toBeVisible();
    expect(screen.getByText("Analyst's Comment:")).toBeVisible();
    expect(screen.getByText("Director's Comment:")).toBeVisible();
    expect(screen.getByText("100")).toBeVisible(); // earned_credits_amount
    expect(screen.getByText("Test Trading Co")).toBeVisible(); // bccr_trading_name
    expect(screen.getByText("123456789012345")).toBeVisible(); // bccr_holding_account_id
    expect(screen.getByText("Analyst's review comment")).toBeVisible(); // analyst_comment

    // Check navigation buttons
    expect(screen.getByRole("button", { name: "Back" })).toBeVisible();
    // Check that action buttons are visible
    expect(screen.getByRole("button", { name: "Decline" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Approve" })).toBeVisible();
  });

  it("renders form without action buttons when user is not CAS director", () => {
    (useSessionRole as any).mockReturnValue("cas_analyst");

    render(
      <InternalReviewByDirectorComponent
        data={mockData}
        complianceReportVersionId={mockComplianceReportVersionId}
      />,
    );

    // Action buttons should not be visible
    expect(
      screen.queryByRole("button", { name: "Decline" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Approve" }),
    ).not.toBeInTheDocument();
  });

  it("disables action buttons when analyst suggestion is not ready to approve", () => {
    const dataWithDifferentSuggestion = {
      ...mockData,
      analyst_suggestion:
        AnalystSuggestion.REQUIRING_CHANGE_OF_BCCR_HOLDING_ACCOUNT_ID,
    };

    render(
      <InternalReviewByDirectorComponent
        data={dataWithDifferentSuggestion}
        complianceReportVersionId={mockComplianceReportVersionId}
      />,
    );

    // Action buttons should be disabled
    expect(screen.getByRole("button", { name: "Decline" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Approve" })).toBeDisabled();
  });

  it("hides action buttons when issuance status is not actionable", () => {
    const dataWithDifferentStatus = {
      ...mockData,
      issuance_status: IssuanceStatus.CREDITS_NOT_ISSUED,
    };

    render(
      <InternalReviewByDirectorComponent
        data={dataWithDifferentStatus}
        complianceReportVersionId={mockComplianceReportVersionId}
      />,
    );

    // Action buttons should not be visible
    expect(
      screen.queryByRole("button", { name: "Decline" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Approve" }),
    ).not.toBeInTheDocument();
  });

  it("handles back navigation correctly for normal status", () => {
    render(
      <InternalReviewByDirectorComponent
        data={mockData}
        complianceReportVersionId={mockComplianceReportVersionId}
      />,
    );

    const backButton = screen.getByText("Back");
    fireEvent.click(backButton);

    expect(mockPush).toHaveBeenCalledWith(
      `/compliance-summaries/${mockComplianceReportVersionId}/review-credits-issuance-request`,
    );
  });

  it("handles back navigation correctly for declined status", () => {
    const declinedData = {
      ...mockData,
      issuance_status: IssuanceStatus.DECLINED,
    };

    render(
      <InternalReviewByDirectorComponent
        data={declinedData}
        complianceReportVersionId={mockComplianceReportVersionId}
      />,
    );

    const backButton = screen.getByText("Back");
    fireEvent.click(backButton);

    expect(mockPush).toHaveBeenCalledWith("/compliance-summaries");
  });

  it("handles approve submission successfully", async () => {
    render(
      <InternalReviewByDirectorComponent
        data={mockData}
        complianceReportVersionId={mockComplianceReportVersionId}
      />,
    );

    const approveButton = screen.getByRole("button", { name: "Approve" });
    fireEvent.click(approveButton);

    await waitFor(() => {
      expect(actionHandler).toHaveBeenCalledWith(
        `compliance/compliance-report-versions/${mockComplianceReportVersionId}/earned-credits`,
        "PUT",
        `/compliance-summaries/${mockComplianceReportVersionId}/track-status-of-issuance`,
        {
          body: JSON.stringify({
            director_comment: "",
            director_decision: "Approved",
          }),
        },
      );
    });

    expect(mockPush).toHaveBeenCalledWith(
      `/compliance-summaries/${mockComplianceReportVersionId}/track-status-of-issuance`,
    );
  });

  it("handles decline submission successfully", async () => {
    render(
      <InternalReviewByDirectorComponent
        data={mockData}
        complianceReportVersionId={mockComplianceReportVersionId}
      />,
    );

    const declineButton = screen.getByRole("button", { name: "Decline" });
    fireEvent.click(declineButton);

    await waitFor(() => {
      expect(actionHandler).toHaveBeenCalledWith(
        `compliance/compliance-report-versions/${mockComplianceReportVersionId}/earned-credits`,
        "PUT",
        `/compliance-summaries/${mockComplianceReportVersionId}/track-status-of-issuance`,
        {
          body: JSON.stringify({
            director_comment: "",
            director_decision: "Declined",
          }),
        },
      );
    });

    expect(mockPush).toHaveBeenCalledWith(
      `/compliance-summaries/${mockComplianceReportVersionId}/track-status-of-issuance`,
    );
  });

  it("handles submission error and displays error message", async () => {
    (actionHandler as any).mockResolvedValue({ error: "Submission failed" });

    render(
      <InternalReviewByDirectorComponent
        data={mockData}
        complianceReportVersionId={mockComplianceReportVersionId}
      />,
    );

    const approveButton = screen.getByRole("button", { name: "Approve" });
    fireEvent.click(approveButton);

    await waitFor(() => {
      expect(actionHandler).toHaveBeenCalled();
    });

    // Should not navigate on error
    expect(mockPush).not.toHaveBeenCalledWith(
      `/compliance-summaries/${mockComplianceReportVersionId}/track-status-of-issuance`,
    );

    expect(screen.getByText("Submission failed")).toBeVisible();
  });

  it("displays awaiting note when issuance status is issuance requested", () => {
    render(
      <InternalReviewByDirectorComponent
        data={mockData}
        complianceReportVersionId={mockComplianceReportVersionId}
      />,
    );

    expect(
      screen.getByText(
        "Once the issuance request is approved, the earned credits will be issued to the holding account as identified above in B.C. Carbon Registry.",
      ),
    ).toBeVisible();
  });

  it("displays changes note when issuance status is changes required", () => {
    const changesRequiredData = {
      ...mockData,
      issuance_status: IssuanceStatus.CHANGES_REQUIRED,
    };

    render(
      <InternalReviewByDirectorComponent
        data={changesRequiredData}
        complianceReportVersionId={mockComplianceReportVersionId}
      />,
    );

    expect(
      screen.getByText(
        "Change of BCCR Holding Account ID was required in the previous step. You cannot approve or decline this request until industry user has updated their BCCR Holding Account ID.",
      ),
    ).toBeVisible();
  });

  it("displays declined note when issuance status is declined", () => {
    const declinedData = {
      ...mockData,
      issuance_status: IssuanceStatus.DECLINED,
    };

    render(
      <InternalReviewByDirectorComponent
        data={declinedData}
        complianceReportVersionId={mockComplianceReportVersionId}
      />,
    );

    expect(
      screen.getByText(
        "Supplementary report was required in the previous step, this request has been declined automatically.",
      ),
    ).toBeVisible();
  });
});
