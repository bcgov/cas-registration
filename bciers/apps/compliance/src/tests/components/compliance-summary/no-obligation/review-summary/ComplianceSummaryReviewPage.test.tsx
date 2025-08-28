import { render, screen } from "@testing-library/react";
import ComplianceSummaryReviewPage from "@/compliance/src/app/components/compliance-summary/no-obligation/review-summary/ComplianceSummaryReviewPage";

vi.mock("@/compliance/src/app/utils/getComplianceSummary", () => ({
  getComplianceSummary: vi.fn().mockResolvedValue({
    id: 1,
    reporting_year: 2024,
    emissions_attributable_for_compliance: "0",
    emissions_limit: "0",
    excess_emissions: "0",
    penalty_status: "NONE",
    outstanding_balance_tco2e: 5,
  }),
}));

vi.mock("@/compliance/src/app/components/layout/CompliancePageLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>Mock Layout {children}</div>
  ),
}));

vi.mock(
  "@/compliance/src/app/components/compliance-summary/no-obligation/review-summary/ComplianceSummaryReviewComponent",
  () => ({
    default: () => <div>Mock No Obligation Review Component</div>,
  }),
);

describe("ComplianceSummaryReviewPage", () => {
  const mockComplianceReportVersionId = 123;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with correct content and generates task list with one item", async () => {
    render(
      await ComplianceSummaryReviewPage({
        compliance_report_version_id: mockComplianceReportVersionId,
      }),
    );

    // Check content is rendered
    expect(screen.getByText("Mock Layout")).toBeVisible();
    expect(
      screen.getByText("Mock No Obligation Review Component"),
    ).toBeVisible();
  });
});
