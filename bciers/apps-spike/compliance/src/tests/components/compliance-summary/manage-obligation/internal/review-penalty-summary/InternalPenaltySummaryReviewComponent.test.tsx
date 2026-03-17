import { render, screen } from "@testing-library/react";
import { InternalPenaltySummaryReviewComponent } from "@/compliance/src/app/components/compliance-summary/manage-obligation/internal/review-penalty-summary/InternalPenaltySummaryReviewComponent";

vi.mock("@bciers/components/form", () => ({
  FormBase: ({
    children,
    formData,
  }: {
    children: React.ReactNode;
    formData: any;
  }) => (
    <div data-testid="form-base">
      <div data-testid="form-data">{JSON.stringify(formData)}</div>
      {children}
    </div>
  ),
}));

vi.mock("@/compliance/src/app/components/ComplianceStepButtons", () => ({
  __esModule: true,
  default: ({ backUrl }: { backUrl: string }) => <div>Back: {backUrl}</div>,
}));

const baseData = {
  id: 1,
} as any;

describe("InternalPenaltySummaryReviewComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the form with correct data", () => {
    render(
      <InternalPenaltySummaryReviewComponent
        data={baseData}
        complianceReportVersionId={123}
        hasLateSubmissionPenalty={false}
      />,
    );

    const formBase = screen.getByTestId("form-base");
    expect(formBase).toBeVisible();

    const formData = screen.getByTestId("form-data");
    expect(formData).toHaveTextContent(JSON.stringify(baseData));
  });

  it("renders step buttons with back URL to interest summary when there is a late submission penalty", () => {
    render(
      <InternalPenaltySummaryReviewComponent
        data={baseData}
        complianceReportVersionId={123}
        hasLateSubmissionPenalty={true}
      />,
    );

    expect(
      screen.getByText(
        "Back: /compliance-administration/compliance-summaries/123/review-interest-summary",
      ),
    ).toBeVisible();
  });

  it("renders step buttons with back URL to compliance obligation report when there is no late submission penalty", () => {
    render(
      <InternalPenaltySummaryReviewComponent
        data={baseData}
        complianceReportVersionId={123}
        hasLateSubmissionPenalty={false}
      />,
    );

    expect(
      screen.getByText(
        "Back: /compliance-administration/compliance-summaries/123/review-compliance-obligation-report",
      ),
    ).toBeVisible();
  });
});
