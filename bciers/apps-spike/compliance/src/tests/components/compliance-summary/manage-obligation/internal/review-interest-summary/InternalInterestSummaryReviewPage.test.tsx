import { render, screen } from "@testing-library/react";
import InternalInterestSummaryReviewPage from "@/compliance/src/app/components/compliance-summary/manage-obligation/internal/review-interest-summary/InternalInterestSummaryReviewPage";

import {
  generateReviewObligationPenaltyTaskList,
  ActivePage,
} from "@/compliance/src/app/components/taskLists/internal/reviewObligationPenaltyTaskList";

// Mocks
vi.mock(
  "@/compliance/src/app/components/taskLists/internal/reviewObligationPenaltyTaskList",
  () => ({
    generateReviewObligationPenaltyTaskList: vi.fn(() => ["mock-task"]),
    ActivePage: {
      ReviewInterestSummary: "ReviewInterestSummary",
    },
  }),
);

vi.mock("@/compliance/src/app/utils/getComplianceSummary", () => ({
  getComplianceSummary: vi.fn().mockResolvedValue({
    reporting_year: 2030,
    has_late_submission_penalty: true,
    penalty_status: "NOT PAID",
    outstanding_balance_tco2e: 0,
  }),
}));

vi.mock("@/compliance/src/app/utils/getLateSubmissionPenalty", () => ({
  default: () => ({
    total_amount: "123.45",
  }),
}));

vi.mock("@/compliance/src/app/components/layout/CompliancePageLayout", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div>Mock Layout {children}</div>
  ),
}));

vi.mock(
  "@/compliance/src/app/components/compliance-summary/manage-obligation/internal/review-interest-summary/InternalInterestSummaryReviewComponent",
  () => ({
    __esModule: true,
    default: () => <div>Internal Interest Summary Review Component</div>,
  }),
);

describe("InternalInterestSummaryReviewPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with correct content and generates task list", async () => {
    render(
      await InternalInterestSummaryReviewPage({
        compliance_report_version_id: 789,
      }),
    );

    expect(screen.getByText("Mock Layout")).toBeVisible();
    expect(
      screen.getByText("Internal Interest Summary Review Component"),
    ).toBeVisible();

    expect(generateReviewObligationPenaltyTaskList).toHaveBeenCalledWith(
      789,
      {
        reportingYear: 2030,
        penaltyStatus: "NOT PAID",
        outstandingBalance: 0,
        hasLateSubmissionPenalty: true,
      },
      ActivePage.ReviewInterestSummary,
    );
  });
});
