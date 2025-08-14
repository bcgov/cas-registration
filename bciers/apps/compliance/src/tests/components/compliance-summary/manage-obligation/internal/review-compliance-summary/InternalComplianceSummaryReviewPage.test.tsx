import { render, screen, waitFor } from "@testing-library/react";
import InternalComplianceSummaryReviewPage from "@/compliance/src/app/components/compliance-summary/manage-obligation/internal/review-compliance-summary/InternalComplianceSummaryReviewPage";

// Mocks
vi.mock("@/compliance/src/app/utils/getComplianceSummary", () => ({
  getComplianceSummary: vi.fn(),
}));

vi.mock(
  "@/compliance/src/app/components/taskLists/internal/reviewObligationPenaltyTaskList",
  () => ({
    generateReviewObligationPenaltyTaskList: vi.fn(() => [
      { type: "Page", title: "Mock Page 1" },
      { type: "Page", title: "Mock Page 2" },
    ]),
    ActivePage: {
      ReviewComplianceObligationReport: "ReviewComplianceObligationReport",
      ReviewPenaltySummary: "ReviewPenaltySummary",
    },
  }),
);

vi.mock("@/compliance/src/app/components/layout/CompliancePageLayout", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div>Mock Layout {children}</div>
  ),
}));

vi.mock(
  "@/compliance/src/app/components/compliance-summary/manage-obligation/internal/review-compliance-summary/InternalComplianceSummaryReviewComponent",
  () => ({
    __esModule: true,
    InternalComplianceSummaryReviewComponent: ({ data }: any) => (
      <div>Mock Internal Review Component - {data.reporting_year}</div>
    ),
  }),
);

import { getComplianceSummary } from "@/compliance/src/app/utils/getComplianceSummary";
import {
  generateReviewObligationPenaltyTaskList,
  ActivePage,
} from "@/compliance/src/app/components/taskLists/internal/reviewObligationPenaltyTaskList";

describe("InternalComplianceSummaryReviewPage (Manage Obligation)", () => {
  const mockComplianceReportVersionId = 456;
  const mockData = {
    id: 2,
    reporting_year: 2026,
    operation_name: "Mock Operation",
    excess_emissions: 0,
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    (getComplianceSummary as vi.Mock).mockResolvedValue(mockData);
  });

  it("fetches data, generates internal task list (2 pages), and renders layout with internal review component", async () => {
    render(
      await InternalComplianceSummaryReviewPage({
        compliance_report_version_id: mockComplianceReportVersionId,
      }),
    );

    await waitFor(() => {
      expect(screen.getByText("Mock Layout")).toBeVisible();
      expect(
        screen.getByText("Mock Internal Review Component - 2026"),
      ).toBeVisible();
    });

    expect(getComplianceSummary).toHaveBeenCalledWith(
      mockComplianceReportVersionId,
    );
    expect(generateReviewObligationPenaltyTaskList).toHaveBeenCalledWith(
      456,
      2026,
      ActivePage.ReviewComplianceObligationReport,
    );
  });
});
