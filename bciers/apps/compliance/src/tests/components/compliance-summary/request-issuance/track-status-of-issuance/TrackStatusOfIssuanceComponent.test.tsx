import { fireEvent, render, screen } from "@testing-library/react";
import TrackStatusOfIssuanceComponent from "@/compliance/src/app/components/compliance-summary/request-issuance/track-status-of-issuance/TrackStatusOfIssuanceComponent";
import { IssuanceStatus } from "@bciers/utils/src/enums";
import { RequestIssuanceComplianceSummaryData } from "@/compliance/src/app/types";

// Mock the note components
vi.mock(
  "@/compliance/src/app/components/compliance-summary/request-issuance/track-status-of-issuance/IssuanceStatusApprovedNote",
  () => ({
    IssuanceStatusApprovedNote: () => <div>Approved Note</div>,
  }),
);

vi.mock(
  "@/compliance/src/app/components/compliance-summary/request-issuance/track-status-of-issuance/IssuanceStatusDeclinedNote",
  () => ({
    IssuanceStatusDeclinedNote: () => <div>Declined Note</div>,
  }),
);

vi.mock(
  "@/compliance/src/app/components/compliance-summary/request-issuance/track-status-of-issuance/IssuanceStatusAwaitingNote",
  () => ({
    IssuanceStatusAwaitingNote: () => <div>Awaiting Note</div>,
  }),
);

vi.mock(
  "@/compliance/src/app/components/compliance-summary/request-issuance/track-status-of-issuance/IssuanceStatusChangesRequiredNote",
  () => ({
    IssuanceStatusChangesRequiredNote: () => <div>Changes Required Note</div>,
  }),
);

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("TrackStatusOfIssuanceComponent", () => {
  const mockComplianceSummaryId = "123";
  const mockData: RequestIssuanceComplianceSummaryData = {
    reporting_year: 2023,
    emissions_attributable_for_compliance: 85,
    emission_limit: 100,
    excess_emissions: -15,
    earned_credits_amount: 100,
    issuance_status: IssuanceStatus.APPROVED,
    bccr_trading_name: "Test Trading Name",
    bccr_holding_account_id: "123456789",
    analyst_comment: "Analyst's comment",
    director_comment: "Director's comment",
    analyst_submitted_by: "Test Analyst",
    analyst_submitted_date: "2023-01-01",
    analyst_suggestion: "ready_to_approve" as any,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders form fields and navigation buttons for approved status", () => {
    render(
      <TrackStatusOfIssuanceComponent
        data={mockData}
        complianceSummaryId={mockComplianceSummaryId}
      />,
    );

    // Check form title
    expect(screen.getByText("Track Status of Issuance")).toBeVisible();

    // Check section headers
    expect(screen.getByText("Status of Issuance")).toBeVisible();

    // Check field labels
    expect(screen.getByText("Earned Credits:")).toBeVisible();
    expect(screen.getByText("Status of Issuance:")).toBeVisible();
    expect(screen.getByText("BCCR Trading Name:")).toBeVisible();
    expect(screen.getByText("Director's Comment:")).toBeVisible();

    // Check field values
    expect(screen.getByText("100")).toBeVisible();
    expect(screen.getByText("Approved, credits issued in BCCR")).toBeVisible();
    expect(screen.getByText("Test Trading Name")).toBeVisible();
    expect(screen.getByText("Director's comment")).toBeVisible();

    // Check navigation buttons
    expect(screen.getByRole("button", { name: "Back" })).toBeVisible();
  });

  it("handles back button navigation for approved status", () => {
    render(
      <TrackStatusOfIssuanceComponent
        data={mockData}
        complianceSummaryId={mockComplianceSummaryId}
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
      <TrackStatusOfIssuanceComponent
        data={declinedData}
        complianceSummaryId={mockComplianceSummaryId}
      />,
    );

    const backButton = screen.getByRole("button", { name: "Back" });
    fireEvent.click(backButton);
    expect(mockPush).toHaveBeenCalledWith("/compliance-summaries");
  });

  it("handles back button navigation for issuance requested status", () => {
    const requestedData = {
      ...mockData,
      issuance_status: IssuanceStatus.ISSUANCE_REQUESTED,
    };

    render(
      <TrackStatusOfIssuanceComponent
        data={requestedData}
        complianceSummaryId={mockComplianceSummaryId}
      />,
    );

    const backButton = screen.getByRole("button", { name: "Back" });
    fireEvent.click(backButton);
    expect(mockPush).toHaveBeenCalledWith("/compliance-summaries");
  });

  it("handles back button navigation for other statuses", () => {
    const otherStatusData = {
      ...mockData,
      issuance_status: IssuanceStatus.CREDITS_NOT_ISSUED,
    };

    render(
      <TrackStatusOfIssuanceComponent
        data={otherStatusData}
        complianceSummaryId={mockComplianceSummaryId}
      />,
    );

    const backButton = screen.getByRole("button", { name: "Back" });
    fireEvent.click(backButton);
    expect(mockPush).toHaveBeenCalledWith(
      `/compliance-summaries/${mockComplianceSummaryId}/request-issuance-of-earned-credits`,
    );
  });

  it("displays approved note for approved status", () => {
    render(
      <TrackStatusOfIssuanceComponent
        data={mockData}
        complianceSummaryId={mockComplianceSummaryId}
      />,
    );

    expect(screen.getByText("Approved Note")).toBeVisible();
  });

  it("displays declined note for declined status", () => {
    const declinedData = {
      ...mockData,
      issuance_status: IssuanceStatus.DECLINED,
    };

    render(
      <TrackStatusOfIssuanceComponent
        data={declinedData}
        complianceSummaryId={mockComplianceSummaryId}
      />,
    );

    expect(screen.getByText("Declined Note")).toBeVisible();
  });

  it("displays awaiting note for issuance requested status", () => {
    const requestedData = {
      ...mockData,
      issuance_status: IssuanceStatus.ISSUANCE_REQUESTED,
    };

    render(
      <TrackStatusOfIssuanceComponent
        data={requestedData}
        complianceSummaryId={mockComplianceSummaryId}
      />,
    );

    expect(screen.getByText("Awaiting Note")).toBeVisible();
  });

  it("displays changes required note for changes required status", () => {
    const changesRequiredData = {
      ...mockData,
      issuance_status: IssuanceStatus.CHANGES_REQUIRED,
    };

    render(
      <TrackStatusOfIssuanceComponent
        data={changesRequiredData}
        complianceSummaryId={mockComplianceSummaryId}
      />,
    );

    expect(screen.getByText("Changes Required Note")).toBeVisible();
  });
});
