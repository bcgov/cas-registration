import { render, screen } from "@testing-library/react";
import ComplianceSummaryReviewPage from "@/compliance/src/app/components/compliance-summary/request-issuance/review-compliance-earned-credits-report/ComplianceSummaryReviewPage";
import {
  ActivePage,
  generateRequestIssuanceTaskList,
} from "@/compliance/src/app/components/taskLists/requestIssuanceTaskList";
import { IssuanceStatus } from "@bciers/utils/src/enums";
import { getRequestIssuanceComplianceSummaryData } from "@/compliance/src/app/utils/getRequestIssuanceComplianceSummaryData";

// Mock the compliance summary data function
vi.mock(
  "@/compliance/src/app/utils/getRequestIssuanceComplianceSummaryData",
  () => ({
    getRequestIssuanceComplianceSummaryData: vi.fn(),
  }),
);

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
  "@/compliance/src/app/components/compliance-summary/request-issuance/review-compliance-earned-credits-report/ComplianceSummaryReviewComponent",
  () => ({
    default: () => <div>Mock Review Component</div>,
  }),
);

describe("ComplianceSummaryReviewPage", () => {
  const mockComplianceReportVersionId = 123;
  const mockData = {
    id: 1,
    reporting_year: 2024,
    earned_credits_amount: 15,
    issuance_status: IssuanceStatus.CREDITS_NOT_ISSUED,
    operation_name: "Test Operation",
    emissions_attributable_for_compliance: "85.0",
    emission_limit: "100.0",
    excess_emissions: "-15.0",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (getRequestIssuanceComplianceSummaryData as any).mockResolvedValue(
      mockData,
    );
  });

  it("renders with correct content and generates task list", async () => {
    render(
      await ComplianceSummaryReviewPage({
        compliance_report_version_id: mockComplianceReportVersionId,
      }),
    );

    // Check content is rendered
    expect(screen.getByText("Mock Layout")).toBeVisible();
    expect(screen.getByText("Mock Review Component")).toBeVisible();

    // Verify task list generation
    expect(generateRequestIssuanceTaskList).toHaveBeenCalledWith(
      mockComplianceReportVersionId,
      2024,
      IssuanceStatus.CREDITS_NOT_ISSUED,
      ActivePage.ReviewComplianceSummary,
    );
  });
});
