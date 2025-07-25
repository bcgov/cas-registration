import { render, screen } from "@testing-library/react";
import ComplianceSummaryReviewPage from "@/compliance/src/app/components/compliance-summary/request-issuance/internal/review-compliance-summary/ComplianceSummaryReviewPage";
import {
  ActivePage,
  generateIssuanceRequestTaskList,
} from "@/compliance/src/app/components/taskLists/internal/issuanceRequestTaskList";
import { IssuanceStatus } from "@bciers/utils/src/enums";
import { getRequestIssuanceComplianceSummaryData } from "@/compliance/src/app/utils/getRequestIssuanceComplianceSummaryData";
import { redirect } from "next/navigation";

// Mock the compliance summary data function
vi.mock(
  "@/compliance/src/app/utils/getRequestIssuanceComplianceSummaryData",
  () => ({
    getRequestIssuanceComplianceSummaryData: vi.fn(),
  }),
);

// Mock the task list generator
vi.mock(
  "@/compliance/src/app/components/taskLists/internal/issuanceRequestTaskList",
  () => ({
    generateIssuanceRequestTaskList: vi.fn(),
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

// Mock next/navigation
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

describe("Internal ComplianceSummaryReviewPage", () => {
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
    expect(generateIssuanceRequestTaskList).toHaveBeenCalledWith(
      mockComplianceReportVersionId,
      2024,
      ActivePage.ReviewComplianceSummary,
    );
  });

  it("redirects to track status page when issuance status is APPROVED", async () => {
    (getRequestIssuanceComplianceSummaryData as any).mockResolvedValue({
      ...mockData,
      issuance_status: IssuanceStatus.APPROVED,
    });

    await ComplianceSummaryReviewPage({
      compliance_report_version_id: mockComplianceReportVersionId,
    });

    expect(redirect).toHaveBeenCalledWith(
      `/compliance-summaries/${mockComplianceReportVersionId}/track-status-of-issuance`,
    );
  });

  it("redirects to track status page when issuance status is DECLINED", async () => {
    (getRequestIssuanceComplianceSummaryData as any).mockResolvedValue({
      ...mockData,
      issuance_status: IssuanceStatus.DECLINED,
    });

    await ComplianceSummaryReviewPage({
      compliance_report_version_id: mockComplianceReportVersionId,
    });

    expect(redirect).toHaveBeenCalledWith(
      `/compliance-summaries/${mockComplianceReportVersionId}/track-status-of-issuance`,
    );
  });

  it("does not redirect when issuance status is ISSUANCE_REQUESTED", async () => {
    (getRequestIssuanceComplianceSummaryData as any).mockResolvedValue({
      ...mockData,
      issuance_status: IssuanceStatus.ISSUANCE_REQUESTED,
    });

    render(
      await ComplianceSummaryReviewPage({
        compliance_report_version_id: mockComplianceReportVersionId,
      }),
    );

    expect(redirect).not.toHaveBeenCalled();
    expect(screen.getByText("Mock Layout")).toBeVisible();
  });

  it("does not redirect when issuance status is CREDITS_NOT_ISSUED", async () => {
    (getRequestIssuanceComplianceSummaryData as any).mockResolvedValue({
      ...mockData,
      issuance_status: IssuanceStatus.CREDITS_NOT_ISSUED,
    });

    render(
      await ComplianceSummaryReviewPage({
        compliance_report_version_id: mockComplianceReportVersionId,
      }),
    );

    expect(redirect).not.toHaveBeenCalled();
    expect(screen.getByText("Mock Layout")).toBeVisible();
  });
});
