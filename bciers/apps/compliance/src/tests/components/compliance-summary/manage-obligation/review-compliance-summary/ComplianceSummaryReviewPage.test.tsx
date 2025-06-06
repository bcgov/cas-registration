import { render, screen } from "@testing-library/react";
import ComplianceSummaryReviewPage from "@/compliance/src/app/components/compliance-summary/manage-obligation/review-compliance-summary/ComplianceSummaryReviewPage";
import {
  generateManageObligationTaskList,
  ActivePage,
} from "@/compliance/src/app/components/taskLists/1_manageObligationTaskList";

// Mock the task list generator
vi.mock(
  "@/compliance/src/app/components/taskLists/1_manageObligationTaskList",
  () => ({
    generateManageObligationTaskList: vi.fn(),
    ActivePage: { ReviewComplianceSummary: 3 },
  }),
);

// Mock the layout component
vi.mock("@/compliance/src/app/components/layout/CompliancePageLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>Mock Layout {children}</div>
  ),
}));

// Mock the review component
vi.mock(
  "@/compliance/src/app/components/compliance-summary/manage-obligation/review-compliance-summary/ComplianceSummaryReviewComponent",
  () => ({
    ComplianceSummaryReviewComponent: () => <div>Mock Review Component</div>,
  }),
);

describe("ComplianceSummaryReviewPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with correct content and generates task list", async () => {
    render(await ComplianceSummaryReviewPage({ compliance_summary_id: "123" }));

    // Check content is rendered
    expect(screen.getByText("Mock Layout")).toBeVisible();
    expect(screen.getByText("Mock Review Component")).toBeVisible();

    // Verify task list generation
    expect(generateManageObligationTaskList).toHaveBeenCalledWith(
      "123",
      "2025",
      ActivePage.ReviewComplianceSummary,
    );
  });
});
