import { render, screen } from "@testing-library/react";
import RequestIssuanceOfEarnedCreditsPage from "@/compliance/src/app/components/compliance-summary/request-issuance/request-issuance-of-earned-credits/RequestIssuanceOfEarnedCreditsPage";
import {
  ActivePage,
  generateRequestIssuanceTaskList,
} from "@/compliance/src/app/components/taskLists/requestIssuanceTaskList";

// Mock the reporting year utility
vi.mock("@reporting/src/app/utils/getReportingYear", () => ({
  __esModule: true,
  getReportingYear: vi.fn().mockResolvedValue({
    reporting_year: 2024,
    report_due_date: "2025-03-31",
    reporting_window_end: "2025-03-31",
  }),
}));

// Mock the task list generator
vi.mock(
  "@/compliance/src/app/components/taskLists/requestIssuanceTaskList",
  () => ({
    generateRequestIssuanceTaskList: vi.fn(),
    ActivePage: {
      RequestIssuanceOfEarnedCredits: "RequestIssuanceOfEarnedCredits",
    },
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
