import { render, screen } from "@testing-library/react";
import RequestIssuanceOfEarnedCreditsPage from "@/compliance/src/app/components/compliance-summary/request-issuance/request-issuance-of-earned-credits/RequestIssuanceOfEarnedCreditsPage";
import {
  ActivePage,
  generateRequestIssuanceTaskList,
} from "@/compliance/src/app/components/taskLists/requestIssuanceTaskList";
import { IssuanceStatus } from "@bciers/utils/src/enums";
import { getRequestIssuanceComplianceSummaryData } from "@/compliance/src/app/utils/getRequestIssuanceComplianceSummaryData";

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
vi.mock(
  "@/compliance/src/app/utils/getRequestIssuanceComplianceSummaryData",
  () => ({
    getRequestIssuanceComplianceSummaryData: vi.fn(),
  }),
);

describe("RequestIssuanceOfEarnedCreditsPage", () => {
  const mockComplianceReportVersionId = 123;
  const mockData = {
    id: "123",
    reporting_year: 2024,
    earned_credits_amount: 100,
    issuance_status: IssuanceStatus.CREDITS_NOT_ISSUED,
    bccr_trading_name: "Test Trading Name",
    bccr_holding_account_id: "123456789",
    analyst_comment: "Test comment",
    analyst_suggestion: "ready_to_approve",
    analyst_submitted_date: "2024-01-01",
    analyst_submitted_by: "Test Analyst",
    director_comment: "Test director comment",
    director_submitted_date: "2024-01-01",
    director_submitted_by: "Test Director",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (getRequestIssuanceComplianceSummaryData as any).mockResolvedValue(
      mockData,
    );
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
      ActivePage.RequestIssuanceOfEarnedCredits,
    );
  });
});
