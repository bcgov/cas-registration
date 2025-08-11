import { render, screen } from "@testing-library/react";
import { IssuanceStatus } from "@bciers/utils/src/enums";
import InternalTrackStatusOfIssuancePage from "@/compliance/src/app/components/compliance-summary/request-issuance/internal/track-status-of-issuance/InternalTrackStatusOfIssuancePage";
import {
  ActivePage,
  generateIssuanceRequestTaskList,
} from "@/compliance/src/app/components/taskLists/internal/issuanceRequestTaskList";
import { getRequestIssuanceComplianceSummaryData } from "@/compliance/src/app/utils/getRequestIssuanceComplianceSummaryData";

// Mock the compliance summary data function
vi.mock(
  "@/compliance/src/app/utils/getRequestIssuanceComplianceSummaryData",
  () => ({
    getRequestIssuanceComplianceSummaryData: vi.fn(),
  }),
);

vi.mock(
  "@/compliance/src/app/components/taskLists/internal/issuanceRequestTaskList",
  () => ({
    generateIssuanceRequestTaskList: vi.fn(),
    ActivePage: { TrackStatusOfIssuance: "TrackStatusOfIssuance" },
  }),
);

// Mock the layout component
vi.mock("@/compliance/src/app/components/layout/CompliancePageLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>Mock Layout {children}</div>
  ),
}));

// Mock the track status component
vi.mock(
  "@/compliance/src/app/components/compliance-summary/request-issuance/internal/track-status-of-issuance/InternalTrackStatusOfIssuanceComponent",
  () => ({
    default: () => <div>Mock Track Status Component</div>,
  }),
);

// Mock next/navigation
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

describe("InternalTrackStatusOfIssuancePage", () => {
  const mockComplianceReportVersionId = 123;
  const mockPageData = {
    id: 123,
    reporting_year: 2024,
    earned_credits_amount: 100,
    issuance_status: IssuanceStatus.APPROVED,
    bccr_trading_name: "Test Trading Name",
    bccr_holding_account_id: "123456789",
    analyst_comment: "Analyst's test comments",
    analyst_suggestion: "ready_to_approve",
    analyst_submitted_date: "2024-01-01",
    analyst_submitted_by: "Test Analyst",
    director_comment: "Director's test comments",
    director_submitted_date: "2024-01-01",
    director_submitted_by: "Test Director",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (getRequestIssuanceComplianceSummaryData as any).mockResolvedValue(
      mockPageData,
    );
  });

  it("renders the component with data", async () => {
    const Page = await InternalTrackStatusOfIssuancePage({
      compliance_report_version_id: mockComplianceReportVersionId,
    });

    render(Page);

    // Verify the component renders without errors
    expect(screen.getByText("Mock Layout")).toBeVisible();
    expect(screen.getByText("Mock Track Status Component")).toBeVisible();
    expect(generateIssuanceRequestTaskList).toHaveBeenCalledWith(
      mockComplianceReportVersionId,
      2024,
      ActivePage.TrackStatusOfIssuance,
    );
  });
});
