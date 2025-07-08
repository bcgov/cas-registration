import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
// import { getRequestIssuanceTrackStatusData } from "@/compliance/src/app/utils/getRequestIssuanceTrackStatusData";
import { IssuanceStatus } from "@bciers/utils/src/enums";
import InternalTrackStatusOfIssuancePage from "@/compliance/src/app/components/compliance-summary/request-issuance/internal/track-status-of-issuance/InternalTrackStatusOfIssuancePage";
import {
  ActivePage,
  generateIssuanceRequestTaskList,
} from "@/compliance/src/app/components/taskLists/internal/issuanceRequestTaskList";
import { notFound } from "@bciers/testConfig/mocks";

// Mock the track status data function
vi.mock("@/compliance/src/app/utils/getRequestIssuanceTrackStatusData", () => ({
  getRequestIssuanceTrackStatusData: vi.fn().mockResolvedValue({
    earned_credits: 100,
    issuance_status: "approved",
    bccr_trading_name: "Test Trading Name",
    holding_account_id: "123456789",
    directors_comments: "Director's test comments",
    analysts_comments: "Analyst's test comments",
  }),
}));

vi.mock(
  "@/compliance/src/app/components/taskLists/internal/issuanceRequestTaskList",
  () => ({
    generateIssuanceRequestTaskList: vi.fn(),
    ActivePage: { TrackStatusOfIssuance: "TrackStatusOfIssuance" },
  }),
);

// Mock the reporting year utility
vi.mock("@reporting/src/app/utils/getReportingYear", () => ({
  __esModule: true,
  getReportingYear: vi.fn().mockResolvedValue({
    reporting_year: 2024,
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
  "@/compliance/src/app/components/compliance-summary/request-issuance/internal/track-status-of-issuance/InternalTrackStatusOfIssuanceComponent",
  () => ({
    __esModule: true,
    default: () => <div>Mock Track Status Component</div>,
  }),
);

describe("InternalTrackStatusOfIssuancePage", () => {
  const mockComplianceSummaryId = "123";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the component with data", async () => {
    // Mock the data with an allowed status
    vi.mocked(getRequestIssuanceTrackStatusData).mockResolvedValueOnce({
      earned_credits: 100,
      issuance_status: "approved",
      bccr_trading_name: "Test Trading Name",
      holding_account_id: "123456789",
      directors_comments: "Test comments",
      analysts_comments: "Test comments",
    });

    const Page = await InternalTrackStatusOfIssuancePage({
      compliance_summary_id: mockComplianceSummaryId,
    });

    render(Page);

    // Verify the component renders without errors
    expect(screen.getByText("Mock Track Status Component")).toBeVisible();
    expect(generateIssuanceRequestTaskList).toHaveBeenCalledWith(
      mockComplianceSummaryId,
      2024,
      ActivePage.TrackStatusOfIssuance,
    );
  });

  it("calls notFound for restricted statuses", async () => {
    const restrictedStatuses = [
      IssuanceStatus.CHANGES_REQUIRED,
      IssuanceStatus.ISSUANCE_REQUESTED,
    ];

    for (const status of restrictedStatuses) {
      // Reset mock before each test
      vi.mocked(notFound).mockClear();

      // Mock the data with a restricted status
      vi.mocked(getRequestIssuanceTrackStatusData).mockResolvedValueOnce({
        earned_credits: 100,
        issuance_status: status,
        bccr_trading_name: "Test Trading Name",
        holding_account_id: "123456789",
        directors_comments: "Test comments",
        analysts_comments: "Test comments",
      });

      await InternalTrackStatusOfIssuancePage({
        compliance_summary_id: mockComplianceSummaryId,
      });

      // Verify notFound was called
      expect(notFound).toHaveBeenCalled();
    }
  });
});
