import { render, screen } from "@testing-library/react";
import ObligationTrackPaymentsPayPage from "@/compliance/src/app/components/compliance-summary/manage-obligation/pay-obligation-track-payments/ObligationTrackPaymentsPayPage";
import {
  generateManageObligationTaskList,
  ActivePage,
} from "@/compliance/src/app/components/taskLists/1_manageObligationTaskList";
import { getReportingYear } from "@reporting/src/app/utils/getReportingYear";
import { getComplianceSummaryPayments } from "@/compliance/src/app/utils/getComplianceSummaryPayments";
import { PaymentsData } from "@/compliance/src/app/types";

// Mocks
vi.mock("@reporting/src/app/utils/getReportingYear", () => ({
  getReportingYear: vi.fn(),
}));

vi.mock("@/compliance/src/app/utils/getComplianceSummaryPayments", () => ({
  getComplianceSummaryPayments: vi.fn(),
}));

vi.mock(
  "@/compliance/src/app/components/taskLists/1_manageObligationTaskList",
  () => ({
    generateManageObligationTaskList: vi.fn(),
    ActivePage: { PayObligationTrackPayments: 4 },
  }),
);

vi.mock("@/compliance/src/app/components/layout/CompliancePageLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>Mock Layout {children}</div>
  ),
}));

vi.mock(
  "@/compliance/src/app/components/compliance-summary/manage-obligation/pay-obligation-track-payments/ObligationTrackPaymentsComponent",
  () => ({
    ObligationTrackPaymentsComponent: ({
      data,
      complianceSummaryId,
    }: {
      data: PaymentsData;
      complianceSummaryId: string;
    }) => (
      <div data-testid="obligation-track-payments-component">
        Mock Component - ID: {complianceSummaryId}
        <div data-testid="component-data">{JSON.stringify(data)}</div>
      </div>
    ),
  }),
);

describe("ObligationTrackPaymentsPayPage", () => {
  const mockReportingYear = {
    reporting_year: 2024,
    report_due_date: "2025-03-31",
    reporting_window_end: "2025-03-31",
  };

  const mockPaymentsData: PaymentsData = {
    rows: [
      {
        id: "1",
        received_date: "2025-06-15",
        amount: 1000,
        method: "Credit Card",
        type: "Payment",
        payment_object_id: "abc123",
      },
    ],
    row_count: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (getReportingYear as vi.Mock).mockResolvedValue(mockReportingYear);
    (getComplianceSummaryPayments as vi.Mock).mockResolvedValue(
      mockPaymentsData,
    );
    (generateManageObligationTaskList as vi.Mock).mockReturnValue([
      <div key="mock-task">Mock Task</div>,
    ]);
  });

  it("renders with correct content and generates task list", async () => {
    render(
      await ObligationTrackPaymentsPayPage({ compliance_summary_id: "123" }),
    );

    expect(screen.getByText("Mock Layout")).toBeVisible();
    expect(screen.getByText("Mock Component - ID: 123")).toBeVisible();

    expect(generateManageObligationTaskList).toHaveBeenCalledWith(
      "123",
      2024,
      ActivePage.PayObligationTrackPayments,
    );
  });

  it("passes correct data to the component", async () => {
    render(
      await ObligationTrackPaymentsPayPage({ compliance_summary_id: "456" }),
    );

    const dataDiv = screen.getByTestId("component-data");
    const renderedData = JSON.parse(dataDiv.textContent ?? "{}");

    expect(renderedData).toEqual(mockPaymentsData);
  });

  it("passes correct compliance summary ID to the component", async () => {
    render(
      await ObligationTrackPaymentsPayPage({ compliance_summary_id: "789" }),
    );

    expect(screen.getByText("Mock Component - ID: 789")).toBeVisible();
  });
});
