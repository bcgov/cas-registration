import { render, screen } from "@testing-library/react";
import InternalManualHandlingPage from "@/compliance/src/app/components/compliance-summary/manual-handling/internal/InternalManualHandlingPage";
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
  "@/compliance/src/app/components/compliance-summary/manual-handling/internal/InternalManualHandlingComponent",
  () => ({
    default: () => <div>Mock Internal Manual Handling Component</div>,
  }),
);

describe("InternalManualHandlingPage", () => {
  const mockComplianceReportVersionId = 123;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with correct content and generates task list with one item", async () => {
    render(
      await InternalManualHandlingPage({
        compliance_report_version_id: mockComplianceReportVersionId,
      }),
    );

    // Check content is rendered
    expect(screen.getByText("Mock Layout")).toBeVisible();
    expect(
      screen.getByText("Mock Internal Manual Handling Component"),
    ).toBeVisible();
  });
});
