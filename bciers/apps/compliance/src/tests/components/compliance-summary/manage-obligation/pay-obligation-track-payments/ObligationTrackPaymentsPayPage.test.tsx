import { render, screen } from "@testing-library/react";
import ObligationTrackPaymentsPayPage from "@/compliance/src/app/components/compliance-summary/manage-obligation/pay-obligation-track-payments/ObligationTrackPaymentsPayPage";
import {
  generateManageObligationTaskList,
  ActivePage,
} from "@/compliance/src/app/components/taskLists/1_manageObligationTaskList";

// Mock the task list generator
vi.mock(
  "@/compliance/src/app/components/taskLists/1_manageObligationTaskList",
  () => ({
    generateManageObligationTaskList: vi.fn(),
    ActivePage: { PayObligationTrackPayments: 4 },
  }),
);

// Mock the layout component
vi.mock("@/compliance/src/app/components/layout/CompliancePageLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>Mock Layout {children}</div>
  ),
}));

// Mock the component
vi.mock(
  "@/compliance/src/app/components/compliance-summary/manage-obligation/pay-obligation-track-payments/ObligationTrackPaymentsComponent",
  () => ({
    ObligationTrackPaymentsComponent: ({
      data,
      complianceSummaryId,
    }: {
      data: any;
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
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with correct content and generates task list", async () => {
    render(
      await ObligationTrackPaymentsPayPage({ compliance_summary_id: "123" }),
    );

    // Check content is rendered
    expect(screen.getByText("Mock Layout")).toBeVisible();
    expect(screen.getByText("Mock Component - ID: 123")).toBeVisible();

    // Verify task list generation
    expect(generateManageObligationTaskList).toHaveBeenCalledWith(
      "123",
      "2024",
      ActivePage.PayObligationTrackPayments,
    );
  });

  it("passes correct data to the component", async () => {
    render(
      await ObligationTrackPaymentsPayPage({ compliance_summary_id: "456" }),
    );

    const componentData = screen.getByTestId("component-data");
    const data = JSON.parse(componentData.textContent || "{}");

    expect(data).toEqual({
      reportingYear: "2024",
      outstandingBalance: "0.00",
      equivalentValue: "0.00",
      paymentReceivedDate: "Dec 6, 2025",
      paymentAmountReceived: "8,000.00",
    });
  });

  it("passes correct compliance summary ID to the component", async () => {
    render(
      await ObligationTrackPaymentsPayPage({ compliance_summary_id: "789" }),
    );

    expect(screen.getByText("Mock Component - ID: 789")).toBeVisible();
  });
});
