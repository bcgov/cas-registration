import { render, screen } from "@testing-library/react";
import ComplianceSummaryReviewPage from "@/compliance/src/app/components/compliance-summary/request-issuance/review-compliance-summary/ComplianceSummaryReviewPage";
import {
  ActivePage,
  generateRequestIssuanceTaskList,
} from "@/compliance/src/app/components/taskLists/requestIssuanceTaskList";

// Mock the compliance summary data function
vi.mock(
  "@/compliance/src/app/utils/getRequestIssuanceComplianceSummaryData",
  () => ({
    getRequestIssuanceComplianceSummaryData: vi.fn().mockResolvedValue({
      id: 1,
      reporting_year: 2024,
      earned_credits_amount: 15,
      issuance_status: "Issuance not requested",
      operation_name: "Test Operation",
      emissions_attributable_for_compliance: "85.0",
      emissions_limit: "100.0",
      excess_emissions: "-15.0",
    }),
  }),
);

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

// Mock the layout component
vi.mock("@/compliance/src/app/components/layout/CompliancePageLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>Mock Layout {children}</div>
  ),
}));

// Mock the review component
vi.mock(
  "@/compliance/src/app/components/compliance-summary/request-issuance/review-compliance-summary/ComplianceSummaryReviewComponent",
  () => ({
    default: () => <div>Mock Review Component</div>,
  }),
);

describe("ComplianceSummaryReviewPage", () => {
  const mockComplianceSummaryId = "123";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with correct content and generates task list", async () => {
    render(
      await ComplianceSummaryReviewPage({
        compliance_summary_id: mockComplianceSummaryId,
      }),
    );

    // Check content is rendered
    expect(screen.getByText("Mock Layout")).toBeVisible();
    expect(screen.getByText("Mock Review Component")).toBeVisible();

    // Verify task list generation
    expect(generateRequestIssuanceTaskList).toHaveBeenCalledWith(
      mockComplianceSummaryId,
      2024,
      ActivePage.ReviewComplianceSummary,
    );
  });
});
