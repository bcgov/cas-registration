import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import InternalReviewCreditsIssuanceRequestPage from "@/compliance/src/app/components/compliance-summary/request-issuance/internal/review-credits-issuance-request/InternalReviewCreditsIssuanceRequestPage";
import {
  generateIssuanceRequestTaskList,
  ActivePage,
} from "@/compliance/src/app/components/taskLists/internal/issuanceRequestTaskList";

// Mock the task list generator
vi.mock(
  "@/compliance/src/app/components/taskLists/internal/issuanceRequestTaskList",
  () => ({
    generateIssuanceRequestTaskList: vi.fn(),
    ActivePage: {
      ReviewCreditsIssuanceRequest: "ReviewCreditsIssuanceRequest",
    },
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
  "@/compliance/src/app/components/compliance-summary/request-issuance/internal/review-credits-issuance-request/InternalReviewCreditsIssuanceRequestComponent",
  () => ({
    default: () => <div>Mock Review Component</div>,
  }),
);

// Mock the getCreditsIssuanceRequestData utility
vi.mock("@/compliance/src/app/utils/getCreditsIssuanceRequestData", () => ({
  getCreditsIssuanceRequestData: vi.fn().mockResolvedValue({
    id: "123",
    reporting_year: 2023,
    earned_credits_amount: 100,
    issuance_status: "approved",
    bccr_trading_name: "Test Company",
    holding_account_id: "123456789012345",
    analyst_comment: "Test comment",
    submited_by: "Test User",
    submited_at: "2023-01-01",
    analyst_recommendation: "ready_to_approve",
  }),
}));

describe("InternalReviewCreditsIssuanceRequestPage", () => {
  const mockComplianceSummaryId = "123";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with correct content and generates task list", async () => {
    render(
      await InternalReviewCreditsIssuanceRequestPage({
        compliance_summary_id: mockComplianceSummaryId,
      }),
    );

    // Check content is rendered
    expect(screen.getByText("Mock Layout")).toBeVisible();
    expect(screen.getByText("Mock Review Component")).toBeVisible();

    // Verify task list generation
    expect(generateIssuanceRequestTaskList).toHaveBeenCalledWith(
      mockComplianceSummaryId,
      2023, // From the mocked getCreditsIssuanceRequestData
      ActivePage.ReviewCreditsIssuanceRequest,
    );
  });
});
