import { render, screen, waitFor } from "@testing-library/react";
import ComplianceSummaryReviewPage from "@/compliance/src/app/components/compliance-summary/manage-obligation/review-compliance-summary/ComplianceSummaryReviewPage";

// Mocks
vi.mock(
  "@/compliance/src/app/utils/fetchComplianceSummaryReviewPageData",
  () => ({
    fetchComplianceSummaryReviewPageData: vi.fn(),
  }),
);

vi.mock(
  "@/compliance/src/app/components/taskLists/1_manageObligationTaskList",
  () => ({
    generateManageObligationTaskList: vi.fn(() => ["mock-task"]),
    ActivePage: {
      ReviewComplianceSummary: "ReviewComplianceSummary",
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
  "@/compliance/src/app/components/compliance-summary/manage-obligation/review-compliance-summary/ComplianceSummaryReviewComponent",
  () => ({
    __esModule: true,
    ComplianceSummaryReviewComponent: ({ complianceSummaryId, data }: any) => (
      <div>
        Mock Review Component - {complianceSummaryId} - {data.operation_name}
      </div>
    ),
  }),
);

import { fetchComplianceSummaryReviewPageData } from "@/compliance/src/app/utils/fetchComplianceSummaryReviewPageData";
import { generateManageObligationTaskList } from "@/compliance/src/app/components/taskLists/1_manageObligationTaskList";

describe("ComplianceSummaryReviewPage (Manage Obligation)", () => {
  const mockComplianceSummaryId = "123";
  const mockData = {
    id: 1,
    reporting_year: 2025,
    excess_emissions: 0,
    earned_credits_amount: 10,
    issuance_status: "Not Issued",
    operation_name: "Mock Operation",
    emissions_attributable_for_compliance: "100.0",
    emission_limit: "90.0",
    earned_credits_issued: false,
    monetary_payments: { rows: [], row_count: 0 },
    applied_units_summary: {
      compliance_report_version_id: "123",
      applied_compliance_units: [],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (fetchComplianceSummaryReviewPageData as vi.Mock).mockResolvedValue(
      mockData,
    );
  });

  it("fetches data, generates task list, and renders layout with review component", async () => {
    render(
      await ComplianceSummaryReviewPage({
        compliance_summary_id: mockComplianceSummaryId,
      }),
    );

    await waitFor(() => {
      expect(screen.getByText("Mock Layout")).toBeInTheDocument();
      expect(
        screen.getByText("Mock Review Component - 123 - Mock Operation"),
      ).toBeInTheDocument();
    });

    expect(fetchComplianceSummaryReviewPageData).toHaveBeenCalledWith(
      mockComplianceSummaryId,
    );
    expect(generateManageObligationTaskList).toHaveBeenCalledWith(
      mockComplianceSummaryId,
      2025,
      "ReviewComplianceSummary",
    );
  });
});
