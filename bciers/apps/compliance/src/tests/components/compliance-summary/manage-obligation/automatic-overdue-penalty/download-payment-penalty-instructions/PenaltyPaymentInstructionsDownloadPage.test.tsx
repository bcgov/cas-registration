import { render, screen } from "@testing-library/react";
import PenaltyPaymentInstructionsDownloadPage from "@/compliance/src/app/components/compliance-summary/manage-obligation/automatic-overdue-penalty/download-payment-penalty-instructions/PenaltyPaymentInstructionsDownloadPage";
import {
  generateAutomaticOverduePenaltyTaskList,
  ActivePage,
} from "@/compliance/src/app/components/taskLists/automaticOverduePenaltyTaskList";

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
  "@/compliance/src/app/components/taskLists/automaticOverduePenaltyTaskList",
  () => ({
    generateAutomaticOverduePenaltyTaskList: vi.fn(),
    ActivePage: { DownloadPaymentPenaltyInstruction: 1 },
  }),
);

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
    default: () => {
      return { invoice_number: 1 };
    },
  }),
);

// Mock the layout component
vi.mock("@/compliance/src/app/components/layout/CompliancePageLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>Mock Layout {children}</div>
  ),
}));

describe("PenaltyPaymentInstructionsDownloadPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with correct content and generates task list", async () => {
    render(
      await PenaltyPaymentInstructionsDownloadPage({
        compliance_report_version_id: 123,
      }),
    );

    // Check content is rendered
    expect(screen.getByText("Mock Layout")).toBeVisible();

    // Verify task list generation
    expect(generateAutomaticOverduePenaltyTaskList).toHaveBeenCalledWith(
      123,
      2024,
      ActivePage.DownloadPaymentPenaltyInstruction,
    );
  });

  it("passes custom navigation URLs and invoice ID to PaymentInstructionsDownloadComponent", async () => {
    // reset captured props
    capturedPaymentComponentProps = undefined;

    render(
      await PenaltyPaymentInstructionsDownloadPage({
        compliance_report_version_id: 456,
      }),
    );

    expect(capturedPaymentComponentProps).toBeDefined();

    const expectedBack = `/compliance-summaries/456/review-penalty-summary`;
    const expectedContinue = `/compliance-summaries/456/pay-penalty-track-payments`;

    expect(capturedPaymentComponentProps.customBackUrl).toBe(expectedBack);
    expect(capturedPaymentComponentProps.customContinueUrl).toBe(
      expectedContinue,
    );
    expect(capturedPaymentComponentProps.invoiceID).toBe(1);
    expect(capturedPaymentComponentProps.complianceReportVersionId).toBe(456);
  });
});
