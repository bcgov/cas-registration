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

// Mock the task list data fetching function
vi.mock("@/compliance/src/app/utils/getComplianceSummary", () => ({
  getComplianceSummary: vi.fn().mockResolvedValue({
    penalty_status: "NONE",
    outstanding_balance: 5,
    reporting_year: 2024,
  }),
}));

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
    ComplianceSummaryReviewComponent: ({
      complianceReportVersionId,
      data,
    }: any) => (
      <div>
        Mock Review Component - {complianceReportVersionId} -{" "}
        {data.operation_name}
      </div>
    ),
  }),
);

import { fetchComplianceSummaryReviewPageData } from "@/compliance/src/app/utils/fetchComplianceSummaryReviewPageData";
import {
  generateManageObligationTaskList,
  ActivePage,
} from "@/compliance/src/app/components/taskLists/1_manageObligationTaskList";

describe("ComplianceSummaryReviewPage (Manage Obligation)", () => {
  const mockComplianceReportVersionId = 123;
  const mockData = {
    id: 1,
    reporting_year: 2025,
    excess_emissions: 0,
    earned_credits_amount: 10,
    issuance_status: "Not Issued",
    operation_name: "Mock Operation",
    emissions_attributable_for_compliance: "100.0",
    emissions_limit: "90.0",
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
        compliance_report_version_id: mockComplianceReportVersionId,
      }),
    );

    await waitFor(() => {
      expect(screen.getByText("Mock Layout")).toBeInTheDocument();
      expect(
        screen.getByText("Mock Review Component - 123 - Mock Operation"),
      ).toBeInTheDocument();
    });

    expect(fetchComplianceSummaryReviewPageData).toHaveBeenCalledWith(
      mockComplianceReportVersionId,
    );
    expect(generateManageObligationTaskList).toHaveBeenCalledWith(
      123,
      expect.objectContaining({
        penaltyStatus: "NONE",
        outstandingBalance: 5,
        reportingYear: 2024,
      }),
      ActivePage.ReviewComplianceSummary,
    );
  });
});
