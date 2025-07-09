import { render, screen, waitFor } from "@testing-library/react";
import ComplianceSummaryReviewPage from "@/compliance/src/app/components/compliance-summary/request-issuance/review-compliance-summary/ComplianceSummaryReviewPage";
import { getSessionRole } from "@bciers/utils/src/sessionUtils";
import { fetchComplianceSummaryReviewPageData } from "@/compliance/src/app/utils/fetchComplianceSummaryReviewPageData";
import { generateRequestIssuanceTaskList } from "@/compliance/src/app/components/taskLists/requestIssuanceTaskList";

// ——— Mocks ———
vi.mock("@bciers/utils/src/sessionUtils", () => ({
  getSessionRole: vi.fn(),
}));

vi.mock(
  "@/compliance/src/app/utils/fetchComplianceSummaryReviewPageData",
  () => ({
    fetchComplianceSummaryReviewPageData: vi.fn(),
  }),
);

vi.mock(
  "@/compliance/src/app/components/taskLists/requestIssuanceTaskList",
  () => ({
    generateRequestIssuanceTaskList: vi.fn(() => ["mock-task-item"]),
    ActivePage: { ReviewComplianceSummary: "ReviewComplianceSummary" },
  }),
);

vi.mock(
  "@/compliance/src/app/components/taskLists/internal/issuanceRequestTaskList",
  () => ({
    generateIssuanceRequestTaskList: vi.fn(() => ["mock-internal-task-item"]),
    ActivePage: { ReviewComplianceSummary: "ReviewComplianceSummary" },
  }),
);

vi.mock("@/compliance/src/app/components/layout/CompliancePageLayout", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div>Mock Layout {children}</div>
  ),
}));

vi.mock(
  "@/compliance/src/app/components/compliance-summary/request-issuance/review-compliance-summary/ComplianceSummaryReviewComponent",
  () => ({
    __esModule: true,
    default: ({ complianceSummaryId, isCasStaff }: any) => (
      <div>
        Mock Review Component - {complianceSummaryId} -{" "}
        {isCasStaff ? "cas" : "industry"}
      </div>
    ),
  }),
);

// ——— Setup ———
const mockComplianceSummaryId = "123";
const mockSummaryData = {
  id: 1,
  reporting_year: 2024,
  earned_credits_amount: 15,
  earned_credits_issued: false,
  issuance_status: "Issuance not requested",
  operation_name: "Test Operation",
  emissions_attributable_for_compliance: "85.0",
  emissions_limit: "100.0",
  excess_emissions: -15,
  monetary_payments: { rows: [], row_count: 0 },
  applied_units_summary: {
    compliance_report_version_id: "123",
    applied_compliance_units: [],
  },
};

describe("ComplianceSummaryReviewPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (
      fetchComplianceSummaryReviewPageData as ReturnType<typeof vi.fn>
    ).mockResolvedValue(mockSummaryData);
  });

  it("renders for industry user and calls external task list generator", async () => {
    (getSessionRole as ReturnType<typeof vi.fn>).mockResolvedValue(
      "industry_user",
    );

    render(
      await ComplianceSummaryReviewPage({
        compliance_summary_id: mockComplianceSummaryId,
      }),
    );

    await waitFor(() => {
      expect(screen.getByText("Mock Layout")).toBeVisible();
      expect(
        screen.getByText("Mock Review Component - 123 - industry"),
      ).toBeVisible();
    });

    expect(fetchComplianceSummaryReviewPageData).toHaveBeenCalledWith("123");
    expect(generateRequestIssuanceTaskList).toHaveBeenCalledWith(
      "123",
      2024,
      "ReviewComplianceSummary",
    );
  });

  it("renders for CAS staff and calls internal task list generator", async () => {
    (getSessionRole as ReturnType<typeof vi.fn>).mockResolvedValue(
      "cas_analyst",
    );

    render(
      await ComplianceSummaryReviewPage({
        compliance_summary_id: mockComplianceSummaryId,
      }),
    );

    await waitFor(() => {
      expect(
        screen.getByText("Mock Review Component - 123 - cas"),
      ).toBeVisible();
    });

    const { generateIssuanceRequestTaskList } = await import(
      "@/compliance/src/app/components/taskLists/internal/issuanceRequestTaskList"
    );

    expect(generateIssuanceRequestTaskList).toHaveBeenCalledWith(
      "123",
      2024,
      "ReviewComplianceSummary",
    );
  });
});
