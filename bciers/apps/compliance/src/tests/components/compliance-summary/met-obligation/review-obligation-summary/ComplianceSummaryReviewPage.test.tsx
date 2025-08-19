import { render, screen, waitFor } from "@testing-library/react";
import ComplianceSummaryReviewPage from "@/compliance/src/app/components/compliance-summary/met-obligation/review-compliance-summary/ComplianceSummaryReviewPage";

// Mocks
vi.mock(
  "@/compliance/src/app/utils/fetchComplianceSummaryReviewPageData",
  () => ({
    fetchComplianceSummaryReviewPageData: vi.fn(),
  }),
);

vi.mock("@/compliance/src/app/components/layout/CompliancePageLayout", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div>Mock Layout {children}</div>
  ),
}));

vi.mock(
  "@/compliance/src/app/components/compliance-summary/met-obligation/review-obligation-summary/ComplianceSummaryReviewComponent",
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

describe("ComplianceSummaryReviewPage (Met Obligation)", () => {
  const mockComplianceReportVersionId = 123;
  const mockData = {
    id: 1,
    operation_name: "Test Operation",
    reporting_year: 2024,
    compliance_charge_rate: 80.0,
    excess_emissions: 0,
    emissions_limit: "90.0",
    obligation_id: "test-obligation-id",
    outstanding_balance: 0.0,
    equivalent_value: 0.0,
    status: "Obligation fully met",
    outstanding_balance_equivalent_value: 0.0,
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
        screen.getByText("Review 2024 Obligation Summary"),
      ).toBeInTheDocument();
    });

    expect(fetchComplianceSummaryReviewPageData).toHaveBeenCalledWith(
      mockComplianceReportVersionId,
    );
  });
});
