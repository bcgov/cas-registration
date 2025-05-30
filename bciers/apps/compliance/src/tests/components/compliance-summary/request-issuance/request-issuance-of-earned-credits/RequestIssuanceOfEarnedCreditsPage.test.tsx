import { render, screen } from "@testing-library/react";
import RequestIssuanceOfEarnedCreditsPage from "@/compliance/src/app/components/compliance-summary/request-issuance/request-issuance-of-earned-credits/RequestIssuanceOfEarnedCreditsPage";
import {
  ActivePage,
  generateRequestIssuanceTaskList,
} from "@/compliance/src/app/components/taskLists/2_requestIssuanceTaskList";

// Mock the task list generator
vi.mock(
  "@/compliance/src/app/components/taskLists/2_requestIssuanceTaskList",
  () => ({
    generateRequestIssuanceTaskList: vi.fn(),
    ActivePage: { RequestIssuanceOfEarnedCredits: 1 },
  }),
);

// Mock the layout component
vi.mock("@/compliance/src/app/components/layout/CompliancePageLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>Mock Layout {children}</div>
  ),
}));

// Mock the request issuance component
vi.mock(
  "@/compliance/src/app/components/compliance-summary/request-issuance/request-issuance-of-earned-credits/RequestIssuanceOfEarnedCreditsComponent",
  () => ({
    default: () => <div>Mock Request Issuance Component</div>,
  }),
);

describe("RequestIssuanceOfEarnedCreditsPage", () => {
  const mockComplianceSummaryId = "123";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with correct content and generates task list", async () => {
    render(
      await RequestIssuanceOfEarnedCreditsPage({
        compliance_summary_id: "123",
      }),
    );

    // Check content is rendered
    expect(screen.getByText("Mock Layout")).toBeVisible();
    expect(screen.getByText("Mock Request Issuance Component")).toBeVisible();

    // Verify task list generation
    expect(generateRequestIssuanceTaskList).toHaveBeenCalledWith(
      mockComplianceSummaryId,
      2024,
      ActivePage.RequestIssuanceOfEarnedCredits,
    );
  });
});
