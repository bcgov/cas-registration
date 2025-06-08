import { render, screen } from "@testing-library/react";
import TrackStatusOfIssuancePage from "@/compliance/src/app/components/compliance-summary/request-issuance/track-status-of-issuance/TrackStatusOfIssuancePage";
import {
  ActivePage,
  generateRequestIssuanceTaskList,
} from "@/compliance/src/app/components/taskLists/requestIssuanceTaskList";

// Mock the track status data function
vi.mock("@/compliance/src/app/utils/getRequestIssuanceTrackStatusData", () => ({
  getRequestIssuanceTrackStatusData: vi.fn().mockResolvedValue({
    operation_name: "Test Operation",
    earned_credits: 100,
    issuance_status: "approved",
    bccr_trading_name: "Test Trading Name",
    directors_comments: "Director's test comments",
  }),
  IssuanceStatus: {
    APPROVED: "approved",
    AWAITING: "awaiting",
  },
}));

// Mock the session role function
vi.mock("@bciers/utils/src/sessionUtils", () => ({
  getSessionRole: vi.fn().mockResolvedValue("industry_user"),
}));

// Mock the task list generator
vi.mock(
  "@/compliance/src/app/components/taskLists/requestIssuanceTaskList",
  () => ({
    generateRequestIssuanceTaskList: vi.fn(),
    ActivePage: { ReviewComplianceSummary: "ReviewComplianceSummary" },
  }),
);

// Mock the reporting year utility
vi.mock("@reporting/src/app/utils/getReportingYear", () => ({
  __esModule: true,
  getReportingYear: vi.fn().mockResolvedValue({
    reporting_year: 2024,
    report_due_date: "2025-03-31",
    reporting_window_end: "2025-03-31",
  }),
}));

// Mock the layout component
vi.mock("@/compliance/src/app/components/layout/CompliancePageLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>Mock Layout {children}</div>
  ),
}));

// Mock the track status component
vi.mock(
  "@/compliance/src/app/components/compliance-summary/request-issuance/track-status-of-issuance/TrackStatusOfIssuanceComponent",
  () => ({
    default: () => <div>Mock Track Status Component</div>,
  }),
);

describe("TrackStatusOfIssuancePage", () => {
  const mockComplianceSummaryId = "123";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with correct content and generates task list", async () => {
    render(
      await TrackStatusOfIssuancePage({
        compliance_summary_id: mockComplianceSummaryId,
      }),
    );

    // Check content is rendered
    expect(screen.getByText("Mock Layout")).toBeVisible();
    expect(screen.getByText("Mock Track Status Component")).toBeVisible();

    // Verify task list generation
    expect(generateRequestIssuanceTaskList).toHaveBeenCalledWith(
      mockComplianceSummaryId,
      2024,
      ActivePage.TrackStatusOfIssuance,
    );
  });
});
