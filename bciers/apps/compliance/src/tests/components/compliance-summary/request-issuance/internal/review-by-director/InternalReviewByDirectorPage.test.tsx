import { render, screen } from "@testing-library/react";
import InternalReviewByDirectorPage from "@/compliance/src/app/components/compliance-summary/request-issuance/internal/review-by-director/InternalReviewByDirectorPage";
import {
  generateIssuanceRequestTaskList,
  ActivePage,
} from "@/compliance/src/app/components/taskLists/internal/issuanceRequestTaskList";
import { IssuanceStatus } from "@bciers/utils/src/enums";
import { getRequestIssuanceComplianceSummaryData } from "@/compliance/src/app/utils/getRequestIssuanceComplianceSummaryData";
import { redirect } from "next/navigation";

// Mock the task list generator
vi.mock(
  "@/compliance/src/app/components/taskLists/internal/issuanceRequestTaskList",
  () => ({
    generateIssuanceRequestTaskList: vi.fn(),
    ActivePage: { ReviewByDirector: "ReviewByDirector" },
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
  "@/compliance/src/app/components/compliance-summary/request-issuance/internal/review-by-director/InternalReviewByDirectorComponent",
  () => ({
    default: () => <div>Mock Review Component</div>,
  }),
);

// Mock the getRequestIssuanceComplianceSummaryData utility
vi.mock(
  "@/compliance/src/app/utils/getRequestIssuanceComplianceSummaryData",
  () => ({
    getRequestIssuanceComplianceSummaryData: vi.fn(),
  }),
);

// Mock next/navigation
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

describe("InternalReviewByDirectorPage", () => {
  const mockComplianceSummaryId = "123";
  const mockPageData = {
    id: "123",
    reporting_year: 2023,
    earned_credits_amount: 100,
    issuance_status: IssuanceStatus.ISSUANCE_REQUESTED,
    bccr_trading_name: "Test Company",
    holding_account_id: "123456789012345",
    analyst_comment: "Test comment",
    analyst_suggestion: "ready_to_approve",
    director_comment: "Director comment",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (getRequestIssuanceComplianceSummaryData as any).mockResolvedValue(
      mockPageData,
    );
  });

  it("renders with correct content and generates task list", async () => {
    render(
      await InternalReviewByDirectorPage({
        compliance_summary_id: mockComplianceSummaryId,
      }),
    );

    // Check content is rendered
    expect(screen.getByText("Mock Layout")).toBeVisible();
    expect(screen.getByText("Mock Review Component")).toBeVisible();

    // Verify task list generation
    expect(generateIssuanceRequestTaskList).toHaveBeenCalledWith(
      mockComplianceSummaryId,
      2023,
      ActivePage.ReviewByDirector,
    );
  });

  it("redirects when analyst hasn't reviewed the credits issuance request", async () => {
    (getRequestIssuanceComplianceSummaryData as any).mockResolvedValue({
      ...mockPageData,
      analyst_suggestion: null,
    });

    await InternalReviewByDirectorPage({
      compliance_summary_id: mockComplianceSummaryId,
    });

    expect(redirect).toHaveBeenCalledWith(
      `/compliance-summaries/${mockComplianceSummaryId}/review-credits-issuance-request`,
    );
  });

  it("redirects when issuance status is approved", async () => {
    (getRequestIssuanceComplianceSummaryData as any).mockResolvedValue({
      ...mockPageData,
      issuance_status: IssuanceStatus.APPROVED,
    });

    await InternalReviewByDirectorPage({
      compliance_summary_id: mockComplianceSummaryId,
    });

    expect(redirect).toHaveBeenCalledWith(
      `/compliance-summaries/${mockComplianceSummaryId}/track-status-of-issuance`,
    );
  });

  it("redirects when issuance status is declined", async () => {
    (getRequestIssuanceComplianceSummaryData as any).mockResolvedValue({
      ...mockPageData,
      issuance_status: IssuanceStatus.DECLINED,
    });

    await InternalReviewByDirectorPage({
      compliance_summary_id: mockComplianceSummaryId,
    });

    expect(redirect).toHaveBeenCalledWith(
      `/compliance-summaries/${mockComplianceSummaryId}/track-status-of-issuance`,
    );
  });
});
