import { render, screen } from "@testing-library/react";
import RequestIssuanceOfEarnedCreditsPage from "@/compliance/src/app/components/compliance-summary/request-issuance/request-issuance-of-earned-credits/RequestIssuanceOfEarnedCreditsPage";
import {
  ActivePage,
  generateRequestIssuanceTaskList,
} from "@/compliance/src/app/components/taskLists/requestIssuanceTaskList";
import { IssuanceStatus } from "@bciers/utils/src/enums";
import { getRequestIssuanceTrackStatusData } from "@/compliance/src/app/utils/getRequestIssuanceTrackStatusData";

// Mock the reporting year utility
vi.mock("@reporting/src/app/utils/getReportingYear", () => ({
  __esModule: true,
  getReportingYear: vi.fn().mockResolvedValue({
    reporting_year: 2024,
    report_due_date: "2025-03-31",
    reporting_window_end: "2025-03-31",
  }),
}));

// Mock the task list generator
vi.mock(
  "@/compliance/src/app/components/taskLists/requestIssuanceTaskList",
  () => ({
    generateRequestIssuanceTaskList: vi.fn(),
    ActivePage: {
      RequestIssuanceOfEarnedCredits: "RequestIssuanceOfEarnedCredits",
    },
  }),
);

// Mock the layout component
vi.mock("@/compliance/src/app/components/layout/CompliancePageLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>Mock Layout {children}</div>
  ),
}));

// Mock the request issuance component
vi.mock(
  "@/compliance/src/app/components/compliance-summary/request-issuance/request-issuance-of-earned-credits/RequestIssuanceOfEarnedCreditsComponent",
  () => ({
    default: () => <div>Mock Request Issuance Component</div>,
  }),
);

// Mock the compliance summary data function
// vi.mock(
//   "@/compliance/src/app/utils/getRequestIssuanceComplianceSummaryData",
//   () => ({
//     getRequestIssuanceComplianceSummaryData: vi.fn(),
//   }),
// );
// Mock the request issuance data function
vi.mock("@/compliance/src/app/utils/getRequestIssuanceTrackStatusData", () => ({
  getRequestIssuanceTrackStatusData: vi.fn(),
}));

describe("RequestIssuanceOfEarnedCreditsPage", () => {
  const mockComplianceReportVersionId = 123;
  const mockData = {
    earned_credits: 5,
    issuance_status: IssuanceStatus.APPROVED,
    bccr_trading_name: "name",
    holding_account_id: "id",
    director_comment: "comment",
    analyst_comment: "comment",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (getRequestIssuanceTrackStatusData as any).mockResolvedValue(mockData);
  });

  it("renders with correct content and generates task list", async () => {
    render(
      await RequestIssuanceOfEarnedCreditsPage({
        compliance_report_version_id: mockComplianceReportVersionId,
      }),
    );

    // Check content is rendered
    expect(screen.getByText("Mock Layout")).toBeVisible();
    expect(screen.getByText("Mock Request Issuance Component")).toBeVisible();

    // Verify task list generation
    expect(generateRequestIssuanceTaskList).toHaveBeenCalledWith(
      mockComplianceReportVersionId,
      2024,
      IssuanceStatus.APPROVED,
      ActivePage.RequestIssuanceOfEarnedCredits,
    );
  });
});
