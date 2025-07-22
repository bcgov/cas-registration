import { render, screen } from "@testing-library/react";
import PenaltySummaryReviewPage from "@/compliance/src/app/components/compliance-summary/manage-obligation/automatic-overdue-penalty/review-penalty-summary/PenaltySummaryReviewPage";
import {
  generateAutomaticOverduePenaltyTaskList,
  ActivePage,
} from "@/compliance/src/app/components/taskLists/automaticOverduePenaltyTaskList";

// Mock the task list generator
vi.mock(
  "@/compliance/src/app/components/taskLists/automaticOverduePenaltyTaskList",
  () => ({
    generateAutomaticOverduePenaltyTaskList: vi.fn(),
    ActivePage: { ReviewPenaltySummary: "ReviewPenaltySummary" },
  }),
);

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

// Mock the reporting year getter
vi.mock("@reporting/src/app/utils/getReportingYear", () => ({
  getReportingYear: () => ({
    reporting_year: 2025,
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
    render(await PenaltySummaryReviewPage({ compliance_summary_id: "123" }));

    // Check content is rendered
    expect(screen.getByText("Mock Layout")).toBeVisible();
    expect(screen.getByText("Penalty Summary Review Component")).toBeVisible();

    // Verify task list generation
    expect(generateAutomaticOverduePenaltyTaskList).toHaveBeenCalledWith(
      "123",
      2025,
      ActivePage.ReviewPenaltySummary,
    );
  });
});
