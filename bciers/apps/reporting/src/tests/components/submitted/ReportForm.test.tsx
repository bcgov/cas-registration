import { useRouter } from "@bciers/testConfig/mocks";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ReportForm from "@reporting/src/app/components/submitted/ReportForm";
import {
  ReportingFlow,
  ReportingOrigin,
} from "@reporting/src/app/components/taskList/types";

const mockRouterPush = vi.fn();
useRouter.mockReturnValue({
  push: mockRouterPush,
  back: vi.fn(),
});

vi.mock(
  "@reporting/src/app/components/finalReview/templates/FinalReviewReportSections",
  () => ({
    FinalReviewReportSections: ({ data }: { data: any }) => (
      <div data-testid="report-sections">
        Report Sections: {data?.report_operation?.operation_name}
      </div>
    ),
  }),
);

vi.mock(
  "@reporting/src/app/components/submitted/SubmittedAttachmentsSection",
  () => ({
    default: ({ attachments }: { attachments: any[] }) => (
      <div data-testid="attachments-section">
        Attachments count: {attachments.length}
      </div>
    ),
  }),
);

vi.mock(
  "@reporting/src/app/components/submitted/SubmittedVerificationStatementSection",
  () => ({
    default: () => (
      <div data-testid="verification-statement-section">
        Verification Statement Section
      </div>
    ),
  }),
);

const minimalData = {
  report_operation: { operation_name: "Test Op", operation_type: "SFO" },
  report_person_responsible: { first_name: "John", last_name: "Doe" },
  facility_reports: [],
  report_additional_data: { capture_emissions: false },
  report_compliance_summary: { regulatory_values: {}, products: [] },
};

describe("The ReportForm component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.print = vi.fn();
  });

  it("renders report sections and Back button", () => {
    render(
      <ReportForm
        version_id={1}
        flow={ReportingFlow.SFO}
        origin={ReportingOrigin.Submitted}
        data={minimalData as any}
      />,
    );
    expect(screen.getByTestId("report-sections")).toBeVisible();
    expect(screen.getByText("Back to All Reports")).toBeVisible();
    expect(screen.getByText("Report Sections: Test Op")).toBeVisible();
  });

  it("calls router.push when Back to All Reports is clicked", async () => {
    const user = userEvent.setup();
    render(
      <ReportForm
        version_id={1}
        flow={ReportingFlow.SFO}
        origin={ReportingOrigin.Submitted}
        data={minimalData as any}
      />,
    );
    await user.click(screen.getByText("Back to All Reports"));
    expect(mockRouterPush).toHaveBeenCalledWith(
      "/reporting/reports/current-reports",
    );
  });

  it("renders the attachments section when origin is submitted", () => {
    render(
      <ReportForm
        version_id={5}
        flow={ReportingFlow.SFO}
        origin={ReportingOrigin.Submitted}
        data={minimalData as any}
        attachments={[]}
      />,
    );
    expect(screen.getByTestId("attachments-section")).toBeVisible();
    expect(screen.getByText("Attachments count: 0")).toBeVisible();
  });

  it("passes attachments to the attachments section", () => {
    const attachments = [
      {
        id: 1,
        attachment_type: "verification_statement",
        attachment_name: "v.pdf",
      },
    ];
    render(
      <ReportForm
        version_id={5}
        flow={ReportingFlow.SFO}
        origin={ReportingOrigin.Submitted}
        data={minimalData as any}
        attachments={attachments}
      />,
    );
    expect(screen.getByText("Attachments count: 1")).toBeVisible();
  });

  it("does not render the attachments section when origin is annual-report", () => {
    render(
      <ReportForm
        version_id={5}
        flow={ReportingFlow.SFO}
        origin={ReportingOrigin.AnnualReport}
        data={minimalData as any}
      />,
    );
    expect(screen.queryByTestId("attachments-section")).not.toBeInTheDocument();
  });

  it("renders the verification statement section when origin is annual-report", () => {
    render(
      <ReportForm
        version_id={5}
        flow={ReportingFlow.SFO}
        origin={ReportingOrigin.AnnualReport}
        data={minimalData as any}
      />,
    );

    expect(screen.getByTestId("verification-statement-section")).toBeVisible();
  });

  it("does not render the verification statement section for submitted reports", () => {
    render(
      <ReportForm
        version_id={5}
        flow={ReportingFlow.SFO}
        origin={ReportingOrigin.Submitted}
        data={minimalData as any}
      />,
    );

    expect(
      screen.queryByTestId("verification-statement-section"),
    ).not.toBeInTheDocument();
  });
});
