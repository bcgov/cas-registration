import { render, screen } from "@testing-library/react";
import InterestSummaryReviewPage from "@/compliance/src/app/components/compliance-summary/manage-obligation/ggeapar-interest/review-interest-summary/InterestSummaryReviewPage";

import {
  ActivePage,
  generateManageObligationTaskList,
} from "@/compliance/src/app/components/taskLists/1_manageObligationTaskList";

vi.mock(
  "@/compliance/src/app/components/taskLists/1_manageObligationTaskList",
  () => ({
    generateManageObligationTaskList: vi.fn(() => ["mock-task"]),
    ActivePage: {
      ReviewComplianceSummary: "ReviewComplianceSummary",
    },
  }),
);

// Mock the task list data fetching function
vi.mock("@/compliance/src/app/utils/getComplianceSummary", () => ({
  getComplianceSummary: vi.fn().mockResolvedValue({
    outstanding_balance_tco2e: 0,
    reporting_year: 2024,
    has_late_submission_penalty: true,
  }),
}));

// Mock the late submission penalty data getter
vi.mock("@/compliance/src/app/utils/getLateSubmissionPenalty", () => ({
  default: () => ({
    penalty_status: "Late Submission",
    penalty_type: "Monthly",
    months_late: 2,
    monthly_penalty_rate: "5%",
    accumulated_penalty: "100.00",
    faa_interest: "10.00",
    total_amount: "110.00",
  }),
}));

// Mock the layout component
vi.mock("@/compliance/src/app/components/layout/CompliancePageLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>Mock Layout {children}</div>
  ),
}));

// Mock the InterestSummaryReviewComponent
vi.mock(
  "@/compliance/src/app/components/compliance-summary/manage-obligation/ggeapar-interest/review-interest-summary/InterestSummaryReviewComponent",
  () => ({
    default: () => <div>Interest Summary Review Component</div>,
  }),
);

describe("InterestSummaryReviewPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with correct content and generates task list", async () => {
    render(
      await InterestSummaryReviewPage({ compliance_report_version_id: 123 }),
    );

    // Check content is rendered
    expect(screen.getByText("Mock Layout")).toBeVisible();
    expect(screen.getByText("Interest Summary Review Component")).toBeVisible();

    // Verify task list generation
    expect(generateManageObligationTaskList).toHaveBeenCalledWith(
      123,
      {
        outstandingBalance: 0,
        reportingYear: 2024,
        hasLateSubmissionPenalty: true,
      },
      ActivePage.ReviewInterestSummary,
    );
  });
});
