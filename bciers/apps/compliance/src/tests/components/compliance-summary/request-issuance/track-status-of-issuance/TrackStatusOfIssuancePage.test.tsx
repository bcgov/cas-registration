import { render, screen } from "@testing-library/react";
import TrackStatusOfIssuancePage from "@/compliance/src/app/components/compliance-summary/request-issuance/track-status-of-issuance/TrackStatusOfIssuancePage";
import {
  ActivePage,
  generateRequestIssuanceTaskList,
} from "@/compliance/src/app/components/taskLists/requestIssuanceTaskList";
import { IssuanceStatus } from "@bciers/utils/src/enums";
import { getRequestIssuanceComplianceSummaryData } from "@/compliance/src/app/utils/getRequestIssuanceComplianceSummaryData";
import { redirect } from "next/navigation";

// Mock the compliance summary data function
vi.mock(
  "@/compliance/src/app/utils/getRequestIssuanceComplianceSummaryData",
  () => ({
    getRequestIssuanceComplianceSummaryData: vi.fn(),
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

// Mock the task list generator
vi.mock(
  "@/compliance/src/app/components/taskLists/requestIssuanceTaskList",
  () => ({
    generateRequestIssuanceTaskList: vi.fn(),
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
  "@/compliance/src/app/components/compliance-summary/request-issuance/track-status-of-issuance/TrackStatusOfIssuanceComponent",
  () => ({
    default: () => <div>Mock Track Status Component</div>,
  }),
);

// Mock next/navigation
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

describe("TrackStatusOfIssuancePage", () => {
  const mockComplianceReportVersionId = 123;
  const mockData = {
    operation_name: "Test Operation",
    earned_credits: 100,
    issuance_status: IssuanceStatus.APPROVED,
    bccr_trading_name: "Test Trading Name",
    director_comment: "Director's test comments",
    reporting_year: 2024,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (getRequestIssuanceComplianceSummaryData as any).mockResolvedValue(
      mockData,
    );
  });

  it("renders with correct content and generates task list when status is approved", async () => {
    render(
      await TrackStatusOfIssuancePage({
        compliance_report_version_id: mockComplianceReportVersionId,
      }),
    );

    // Check content is rendered
    expect(screen.getByText("Mock Layout")).toBeVisible();
    expect(screen.getByText("Mock Track Status Component")).toBeVisible();

    // Verify task list generation
    expect(generateRequestIssuanceTaskList).toHaveBeenCalledWith(
      mockComplianceReportVersionId,
      2024,
      ActivePage.TrackStatusOfIssuance,
    );
  });

  it("redirects to request issuance page when status is CREDITS_NOT_ISSUED", async () => {
    (getRequestIssuanceComplianceSummaryData as any).mockResolvedValue({
      ...mockData,
      issuance_status: IssuanceStatus.CREDITS_NOT_ISSUED,
    });

    await TrackStatusOfIssuancePage({
      compliance_report_version_id: mockComplianceReportVersionId,
    });

    expect(redirect).toHaveBeenCalledWith(
      `/compliance-summaries/${mockComplianceReportVersionId}/request-issuance-of-earned-credits`,
    );
  });

  it("redirects to request issuance page when status is CHANGES_REQUIRED", async () => {
    (getRequestIssuanceComplianceSummaryData as any).mockResolvedValue({
      ...mockData,
      issuance_status: IssuanceStatus.CHANGES_REQUIRED,
    });

    await TrackStatusOfIssuancePage({
      compliance_report_version_id: mockComplianceReportVersionId,
    });

    expect(redirect).toHaveBeenCalledWith(
      `/compliance-summaries/${mockComplianceReportVersionId}/request-issuance-of-earned-credits`,
    );
  });

  it("does not redirect when status is APPROVED", async () => {
    (getRequestIssuanceComplianceSummaryData as any).mockResolvedValue({
      ...mockData,
      issuance_status: IssuanceStatus.APPROVED,
    });

    render(
      await TrackStatusOfIssuancePage({
        compliance_report_version_id: mockComplianceReportVersionId,
      }),
    );

    expect(redirect).not.toHaveBeenCalled();
    expect(screen.getByText("Mock Layout")).toBeVisible();
  });
});
