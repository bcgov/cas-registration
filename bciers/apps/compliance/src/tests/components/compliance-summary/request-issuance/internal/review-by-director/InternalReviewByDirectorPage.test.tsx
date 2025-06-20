import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import InternalReviewByDirectorPage from "@/compliance/src/app/components/compliance-summary/request-issuance/internal/review-by-director/InternalReviewByDirectorPage";
import {
  generateIssuanceRequestTaskList,
  ActivePage,
} from "@/compliance/src/app/components/taskLists/internal/issuanceRequestTaskList";

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

// Mock the getDirectorReviewData utility
vi.mock("@/compliance/src/app/utils/getDirectorReviewData", () => ({
  getDirectorReviewData: vi.fn().mockReturnValue({
    id: "123",
    reporting_year: 2023,
    earned_credits_amount: 100,
    issuance_status: "approved",
    bccr_trading_name: "Test Company",
    holding_account_id: "123456789012345",
    analyst_comment: "Test comment",
    analyst_recommendation: "ready_to_approve",
    director_comment: "Director comment",
  }),
}));

describe("InternalReviewByDirectorPage", () => {
  const mockComplianceSummaryId = "123";

  beforeEach(() => {
    vi.clearAllMocks();
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
});
