import { render, screen } from "@testing-library/react";
import InterestPaymentInstructionsDownloadPage from "@/compliance/src/app/components/compliance-summary/manage-obligation/ggeapar-interest/download-interest-payment-instructions/InterestPaymentInstructionsDownloadPage";

import {
  ActivePage,
  generateManageObligationTaskList,
} from "@/compliance/src/app/components/taskLists/1_manageObligationTaskList";

// Mock the reporting year utility (kept for parity with penalty tests)
vi.mock("@reporting/src/app/utils/getReportingYear", () => ({
  __esModule: true,
  getReportingYear: vi.fn().mockResolvedValue({
    reporting_year: 2024,
    report_due_date: "2025-03-31",
    reporting_window_end: "2025-03-31",
  }),
}));

vi.mock(
  "@/compliance/src/app/components/taskLists/1_manageObligationTaskList",
  () => ({
    generateManageObligationTaskList: vi.fn(() => ["mock-task"]),
    ActivePage: {
      DownloadInterestPaymentInstructions:
        "DownloadInterestPaymentInstructions",
    },
  }),
);

// Mock the task list data fetching function
vi.mock("@/compliance/src/app/utils/getComplianceSummary", () => ({
  getComplianceSummary: vi.fn().mockResolvedValue({
    penalty_status: "NOT PAID",
    outstanding_balance_tco2e: 0,
    reporting_year: 2024,
    has_late_submission_penalty: false,
    has_overdue_penalty: false,
  }),
}));

let capturedPaymentComponentProps: any;

// Mock the payment instructions component to capture props
vi.mock(
  "@/compliance/src/app/components/compliance-summary/manage-obligation/download-payment-instructions/PaymentInstructionsDownloadComponent",
  () => ({
    __esModule: true,
    default: (props: any) => {
      capturedPaymentComponentProps = props;
      return <div>Mock Payment Component</div>;
    },
  }),
);

// Mock the invoice grabber
vi.mock(
  "@/compliance/src/app/utils/getInvoiceByComplianceReportVersionId",
  () => ({
    __esModule: true,
    default: () => {
      return { invoice_number: 1 };
    },
  }),
);

// Mock the layout component
vi.mock("@/compliance/src/app/components/layout/CompliancePageLayout", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div>Mock Layout {children}</div>
  ),
}));

describe("InterestPaymentInstructionsDownloadPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with correct content and generates task list", async () => {
    render(
      await InterestPaymentInstructionsDownloadPage({
        compliance_report_version_id: 123,
      }),
    );

    // Check content is rendered
    expect(screen.getByText("Mock Layout")).toBeVisible();

    // Verify task list generation
    expect(generateManageObligationTaskList).toHaveBeenCalledWith(
      123,
      {
        penaltyStatus: "NOT PAID",
        outstandingBalance: 0,
        reportingYear: 2024,
        hasLateSubmissionPenalty: false,
        hasOverduePenalty: false,
      },
      ActivePage.DownloadInterestPaymentInstructions,
    );
  });

  it("passes custom navigation URLs and invoice ID to PaymentInstructionsDownloadComponent", async () => {
    // reset captured props
    capturedPaymentComponentProps = undefined;

    render(
      await InterestPaymentInstructionsDownloadPage({
        compliance_report_version_id: 456,
      }),
    );

    expect(capturedPaymentComponentProps).toBeDefined();

    const expectedBack = `/compliance-administration/compliance-summaries/456/review-interest-summary`;
    const expectedContinue = `/compliance-administration/compliance-summaries/456/pay-interest-penalty-track-payments`;

    expect(capturedPaymentComponentProps.customBackUrl).toBe(expectedBack);
    expect(capturedPaymentComponentProps.customContinueUrl).toBe(
      expectedContinue,
    );
    expect(capturedPaymentComponentProps.invoiceID).toBe(1);
    expect(capturedPaymentComponentProps.complianceReportVersionId).toBe(456);
  });
});
