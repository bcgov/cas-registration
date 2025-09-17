import { fireEvent, render, screen } from "@testing-library/react";
import InternalTrackStatusOfIssuanceComponent from "@/compliance/src/app/components/compliance-summary/request-issuance/internal/track-status-of-issuance/InternalTrackStatusOfIssuanceComponent";
import {
  IssuanceStatus,
  AnalystSuggestion,
  FrontEndRoles,
} from "@bciers/utils/src/enums";
import { RequestIssuanceComplianceSummaryData } from "@/compliance/src/app/types";

// Mock the note components
vi.mock(
  "@/compliance/src/app/components/compliance-summary/request-issuance/internal/track-status-of-issuance/InternalIssuanceStatusApprovedNote",
  () => ({
    InternalIssuanceStatusApprovedNote: () => <div>Approved Note</div>,
  }),
);

vi.mock(
  "@/compliance/src/app/components/compliance-summary/request-issuance/internal/track-status-of-issuance/InternalIssuanceStatusDeclinedNote",
  () => ({
    InternalIssuanceStatusDeclinedNote: () => <div>Declined Note</div>,
  }),
);

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

let mockRole: FrontEndRoles = FrontEndRoles.CAS_DIRECTOR;
vi.mock("@bciers/utils/src/sessionUtils", () => ({
  useSessionRole: () => mockRole,
}));

describe("InternalTrackStatusOfIssuanceComponent", () => {
  const mockComplianceReportVersionId = 123;
  const mockData: RequestIssuanceComplianceSummaryData = {
    reporting_year: 2023,
    emissions_attributable_for_compliance: 85,
    emissions_limit: 100,
    excess_emissions: -15,
    earned_credits_amount: 100,
    issuance_status: IssuanceStatus.APPROVED,
    bccr_trading_name: "Test Trading Name",
    bccr_holding_account_id: "123456789",
    director_comment: "Test comments",
    analyst_comment: "Analyst's comment",
    analyst_submitted_by: "Test Analyst",
    analyst_submitted_date: "2023-01-01",
    analyst_suggestion: "ready_to_approve" as any,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows Analyst's Comment for CAS_ANALYST role when auto-declined due to supplementary report", () => {
    const declinedDueToSupplementary: RequestIssuanceComplianceSummaryData = {
      ...mockData,
      issuance_status: IssuanceStatus.DECLINED,
      analyst_suggestion: AnalystSuggestion.REQUIRING_SUPPLEMENTARY_REPORT,
      analyst_comment: "Analyst explains supplementary report requirement",
      director_comment: "Director's comment should be hidden",
    };

    // Set role to CAS Analyst
    mockRole = FrontEndRoles.CAS_ANALYST;

    render(
      <InternalTrackStatusOfIssuanceComponent
        data={declinedDueToSupplementary}
        complianceReportVersionId={mockComplianceReportVersionId}
      />,
    );

    // Analyst's Comment should be shown for internal analyst
    expect(screen.getByText("Analyst's Comment:")).toBeVisible();
    expect(
      screen.getByText("Analyst explains supplementary report requirement"),
    ).toBeVisible();

    // Director's Comment should be hidden in this context
    expect(screen.queryByText("Director's Comment:")).toBeNull();
    expect(
      screen.queryByText("Director's comment should be hidden"),
    ).toBeNull();
  });

  it("hides Analyst's Comment for non-internal reviewer role even when supplementary report required", () => {
    const declinedDueToSupplementary: RequestIssuanceComplianceSummaryData = {
      ...mockData,
      issuance_status: IssuanceStatus.DECLINED,
      analyst_suggestion: AnalystSuggestion.REQUIRING_SUPPLEMENTARY_REPORT,
      analyst_comment: "Analyst explains supplementary report requirement",
    };

    // Set role to a non-internal role (industry user)
    mockRole = FrontEndRoles.INDUSTRY_USER;

    render(
      <InternalTrackStatusOfIssuanceComponent
        data={declinedDueToSupplementary}
        complianceReportVersionId={mockComplianceReportVersionId}
      />,
    );

    // Analyst's Comment should be hidden for non-internal role
    expect(screen.queryByText("Analyst's Comment:")).toBeNull();
    expect(
      screen.queryByText("Analyst explains supplementary report requirement"),
    ).toBeNull();
  });

  it("shows Analyst's Comment and hides Director's Comment for director route when auto-declined due to supplementary report", () => {
    const declinedDueToSupplementary: RequestIssuanceComplianceSummaryData = {
      ...mockData,
      issuance_status: IssuanceStatus.DECLINED,
      analyst_suggestion: AnalystSuggestion.REQUIRING_SUPPLEMENTARY_REPORT,
      analyst_comment: "Analyst explains supplementary report requirement",
      director_comment: "Director's comment should be hidden",
    };

    // Ensure role indicates CAS Director
    mockRole = FrontEndRoles.CAS_DIRECTOR;

    render(
      <InternalTrackStatusOfIssuanceComponent
        data={declinedDueToSupplementary}
        complianceReportVersionId={mockComplianceReportVersionId}
      />,
    );

    // Analyst's Comment should be shown
    expect(screen.getByText("Analyst's Comment:")).toBeVisible();
    expect(
      screen.getByText("Analyst explains supplementary report requirement"),
    ).toBeVisible();

    // Director's Comment should be hidden
    expect(screen.queryByText("Director's Comment:")).toBeNull();
    expect(
      screen.queryByText("Director's comment should be hidden"),
    ).toBeNull();
  });

  it("renders form fields and navigation buttons for approved status", () => {
    render(
      <InternalTrackStatusOfIssuanceComponent
        data={mockData}
        complianceReportVersionId={mockComplianceReportVersionId}
      />,
    );

    // Check form title
    expect(screen.getByText("Track Status of Issuance")).toBeVisible();

    // Check section headers
    expect(screen.getByText("Earned Credits")).toBeVisible();

    // Check field labels
    expect(screen.getByText("Earned Credits:")).toBeVisible();
    expect(screen.getByText("Status of Issuance:")).toBeVisible();
    expect(screen.getByText("BCCR Trading Name:")).toBeVisible();
    expect(screen.getByText("BCCR Holding Account ID:")).toBeVisible();
    expect(screen.getByText("Director's Comment:")).toBeVisible();

    // Check field values
    expect(screen.getByText("100")).toBeVisible();
    expect(screen.getByText("Approved, credits issued in BCCR")).toBeVisible();
    expect(screen.getByText("Test Trading Name")).toBeVisible();
    expect(screen.getByText("123456789")).toBeVisible();
    expect(screen.getByText("Test comments")).toBeVisible();

    // Check navigation buttons
    expect(screen.getByRole("button", { name: "Back" })).toBeVisible();
  });

  it("handles back button navigation for approved status", () => {
    render(
      <InternalTrackStatusOfIssuanceComponent
        data={mockData}
        complianceReportVersionId={mockComplianceReportVersionId}
      />,
    );

    const backButton = screen.getByRole("button", { name: "Back" });
    expect(backButton).toBeVisible();

    fireEvent.click(backButton);
    expect(mockPush).toHaveBeenCalledWith("/compliance-summaries");
  });

  it("handles back button navigation for declined status", () => {
    const declinedData = {
      ...mockData,
      issuance_status: IssuanceStatus.DECLINED,
    };

    render(
      <InternalTrackStatusOfIssuanceComponent
        data={declinedData}
        complianceReportVersionId={mockComplianceReportVersionId}
      />,
    );

    const backButton = screen.getByRole("button", { name: "Back" });
    fireEvent.click(backButton);
    expect(mockPush).toHaveBeenCalledWith("/compliance-summaries");
  });

  it("handles back button navigation for other statuses", () => {
    const otherStatusData = {
      ...mockData,
      issuance_status: IssuanceStatus.ISSUANCE_REQUESTED,
    };

    render(
      <InternalTrackStatusOfIssuanceComponent
        data={otherStatusData}
        complianceReportVersionId={mockComplianceReportVersionId}
      />,
    );

    const backButton = screen.getByRole("button", { name: "Back" });
    fireEvent.click(backButton);
    expect(mockPush).toHaveBeenCalledWith(
      `/compliance-summaries/${mockComplianceReportVersionId}/review-by-director`,
    );
  });

  it("displays approved note for approved status", () => {
    render(
      <InternalTrackStatusOfIssuanceComponent
        data={mockData}
        complianceReportVersionId={mockComplianceReportVersionId}
      />,
    );

    // The approved note should be visible for approved status
    expect(screen.getByText("Approved Note")).toBeVisible();
  });

  it("displays declined note for declined status", () => {
    const declinedData = {
      ...mockData,
      issuance_status: IssuanceStatus.DECLINED,
    };

    render(
      <InternalTrackStatusOfIssuanceComponent
        data={declinedData}
        complianceReportVersionId={mockComplianceReportVersionId}
      />,
    );

    // The declined note should be visible for declined status
    expect(screen.getByText("Declined Note")).toBeVisible();
  });
});
