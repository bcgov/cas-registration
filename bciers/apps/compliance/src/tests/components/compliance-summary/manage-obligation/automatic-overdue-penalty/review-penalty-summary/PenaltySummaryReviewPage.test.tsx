import { render, screen } from "@testing-library/react";
import PenaltySummaryReviewPage from "@/compliance/src/app/components/compliance-summary/manage-obligation/automatic-overdue-penalty/review-penalty-summary/PenaltySummaryReviewPage";

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
vi.mock("@/compliance/src/app/utils/getObligationTasklistData", () => ({
  getObligationTasklistData: vi.fn().mockResolvedValue({
    penalty_status: "NOT PAID",
    outstanding_balance: 0,
    reporting_year: 2024,
  }),
}));

// Mock the automatic overdue penalty data getter
vi.mock("@/compliance/src/app/utils/getAutomaticOverduePenalty", () => ({
  default: () => ({
    penalty_status: "Overdue",
    penalty_type: "Automatic",
    days_late: 30,
    penalty_charge_rate: "10%",
    accumulated_penalty: "1000.00",
    accumulated_compounding: "100.00",
    total_penalty: "1100.00",
    faa_interest: "50.00",
    total_amount: "1150.00",
  }),
}));

// Mock the layout component
vi.mock("@/compliance/src/app/components/layout/CompliancePageLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>Mock Layout {children}</div>
  ),
}));

// Mock the PenaltySummaryReviewComponent
vi.mock(
  "@/compliance/src/app/components/compliance-summary/manage-obligation/automatic-overdue-penalty/review-penalty-summary/PenaltySummaryReviewComponent",
  () => ({
    default: () => <div>Penalty Summary Review Component</div>,
  }),
);

describe("PenaltySummaryReviewPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with correct content and generates task list", async () => {
    render(
      await PenaltySummaryReviewPage({ compliance_report_version_id: 123 }),
    );

    // Check content is rendered
    expect(screen.getByText("Mock Layout")).toBeVisible();
    expect(screen.getByText("Penalty Summary Review Component")).toBeVisible();

    // Verify task list generation
    expect(generateManageObligationTaskList).toHaveBeenCalledWith(
      123,
      {
        penalty_status: "NOT PAID",
        outstanding_balance: 0,
        reporting_year: 2024,
      },
      ActivePage.ReviewPenaltySummary,
    );
  });
});
