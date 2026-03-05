import { render, screen } from "@testing-library/react";
import InternalPenaltySummaryReviewPage from "@/compliance/src/app/components/compliance-summary/manage-obligation/internal/review-penalty-summary/InternalPenaltySummaryReviewPage";
import {
  generateReviewObligationPenaltyTaskList,
  ActivePage,
} from "@/compliance/src/app/components/taskLists/internal/reviewObligationPenaltyTaskList";
import getAutomaticOverduePenalty from "@/compliance/src/app/utils/getAutomaticOverduePenalty";
import { getComplianceSummary } from "@/compliance/src/app/utils/getComplianceSummary";

vi.mock("@/compliance/src/app/utils/getAutomaticOverduePenalty", () => ({
  __esModule: true,
  default: vi.fn().mockResolvedValue({
    id: 1,
    total_amount: "500.00",
  }),
}));

vi.mock("@/compliance/src/app/utils/getComplianceSummary", () => ({
  getComplianceSummary: vi.fn().mockResolvedValue({
    reporting_year: 2025,
    penalty_status: "NOT PAID",
    outstanding_balance_tco2e: 0,
    has_late_submission_penalty: true,
  }),
}));

vi.mock(
  "@/compliance/src/app/components/taskLists/internal/reviewObligationPenaltyTaskList",
  () => ({
    generateReviewObligationPenaltyTaskList: vi.fn(),
    ActivePage: { ReviewPenaltySummary: "ReviewPenaltySummary" },
  }),
);

vi.mock("@/compliance/src/app/components/layout/CompliancePageLayout", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div>Mock Layout {children}</div>
  ),
}));

vi.mock(
  "@/compliance/src/app/components/compliance-summary/manage-obligation/internal/review-penalty-summary/InternalPenaltySummaryReviewComponent",
  () => ({
    __esModule: true,
    InternalPenaltySummaryReviewComponent: () => (
      <div>Mock Internal Penalty Component</div>
    ),
  }),
);

describe("InternalPenaltySummaryReviewPage (Manage Obligation)", () => {
  const mockComplianceReportVersionId = 789;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches data, generates task list, and renders layout with internal penalty component", async () => {
    render(
      await InternalPenaltySummaryReviewPage({
        compliance_report_version_id: mockComplianceReportVersionId,
      }),
    );

    // Check components are rendered
    expect(screen.getByText("Mock Layout")).toBeVisible();
    expect(screen.getByText("Mock Internal Penalty Component")).toBeVisible();

    // Verify data fetching
    expect(getAutomaticOverduePenalty).toHaveBeenCalledWith(
      mockComplianceReportVersionId,
    );
    expect(getComplianceSummary).toHaveBeenCalledWith(
      mockComplianceReportVersionId,
    );

    // Verify task list generation
    expect(generateReviewObligationPenaltyTaskList).toHaveBeenCalledWith(
      mockComplianceReportVersionId,
      {
        reportingYear: 2025,
        penaltyStatus: "NOT PAID",
        outstandingBalance: 0,
        hasLateSubmissionPenalty: true,
      },
      ActivePage.ReviewPenaltySummary,
    );
  });
});
