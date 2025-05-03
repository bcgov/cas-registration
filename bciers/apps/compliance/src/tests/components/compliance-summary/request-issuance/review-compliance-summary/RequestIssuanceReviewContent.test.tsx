import { render, screen } from "@testing-library/react";
import { RequestIssuanceReviewContent } from "@/compliance/src/app/components/compliance-summary/request-issuance/review-compliance-summary/RequestIssuanceReviewContent";

vi.mock(
  "@/compliance/src/app/components/compliance-summary/ComplianceHeading",
  () => ({
    ComplianceHeading: ({ title }: any) => (
      <div data-testid="compliance-heading">{title}</div>
    ),
  }),
);

vi.mock(
  "@/compliance/src/app/components/compliance-summary/request-issuance/review-compliance-summary/FormReport",
  () => ({
    FormReport: ({ data }: any) => (
      <div data-testid="form-report" data-data={JSON.stringify(data)}>
        Form Report Component
      </div>
    ),
  }),
);

vi.mock(
  "@/compliance/src/app/components/compliance-summary/request-issuance/review-compliance-summary/EarnedCredits",
  () => ({
    EarnedCredits: ({ data }: any) => (
      <div data-testid="earned-credits" data-data={JSON.stringify(data)}>
        Earned Credits Component
      </div>
    ),
  }),
);

vi.mock("@bciers/components/form/components/ComplianceStepButtons", () => ({
  default: ({
    backUrl,
    continueUrl,
    backButtonDisabled,
    submitButtonDisabled,
    style,
  }: any) => (
    <div
      data-testid="compliance-step-buttons"
      data-back-url={backUrl}
      data-continue-url={continueUrl}
      data-back-disabled={backButtonDisabled.toString()}
      data-submit-disabled={submitButtonDisabled.toString()}
      style={style}
    >
      Compliance Step Buttons
    </div>
  ),
}));

describe("RequestIssuanceReviewContent", () => {
  const mockProps = {
    backUrl: "/back-url",
    continueUrl: "/continue-url",
    data: {
      operation_name: "Test Operation",
      reporting_year: 2024,
      emissions_attributable_for_compliance: 1000,
      emission_limit: 800,
      excess_emissions: 200,
      earned_credits: 50,
      issuance_status: "Issuance not requested",
    },
    complianceSummaryId: 123,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with the correct title", () => {
    render(<RequestIssuanceReviewContent {...mockProps} />);

    const heading = screen.getByTestId("compliance-heading");
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("Review 2024 Compliance Summary");
  });

  it("renders the FormReport component with correct data", () => {
    render(<RequestIssuanceReviewContent {...mockProps} />);

    const formReport = screen.getByTestId("form-report");
    expect(formReport).toBeInTheDocument();

    const passedData = JSON.parse(formReport.getAttribute("data-data") ?? "{}");
    expect(passedData).toEqual(mockProps.data);
  });

  it("renders the EarnedCredits component with correct data", () => {
    render(<RequestIssuanceReviewContent {...mockProps} />);

    const earnedCredits = screen.getByTestId("earned-credits");
    expect(earnedCredits).toBeInTheDocument();

    const passedData = JSON.parse(
      earnedCredits.getAttribute("data-data") ?? "{}",
    );
    expect(passedData).toEqual(mockProps.data);
  });

  it("renders the ComplianceStepButtons with correct props", () => {
    render(<RequestIssuanceReviewContent {...mockProps} />);

    const buttons = screen.getByTestId("compliance-step-buttons");
    expect(buttons).toBeInTheDocument();

    expect(buttons.getAttribute("data-back-url")).toBe(mockProps.backUrl);
    expect(buttons.getAttribute("data-continue-url")).toBe(
      mockProps.continueUrl,
    );
    expect(buttons.getAttribute("data-back-disabled")).toBe("false");
    expect(buttons.getAttribute("data-submit-disabled")).toBe("false");

    expect(buttons).toHaveStyle({ marginTop: "170px" });
  });

  it("handles missing backUrl gracefully", () => {
    const { backUrl, ...propsWithoutBackUrl } = mockProps;

    render(<RequestIssuanceReviewContent {...propsWithoutBackUrl} />);

    const buttons = screen.getByTestId("compliance-step-buttons");
    expect(buttons.getAttribute("data-back-url")).toBe(null);
    expect(buttons.getAttribute("data-continue-url")).toBe(
      mockProps.continueUrl,
    );
  });

  it("renders all components in the correct order", () => {
    const { container } = render(
      <RequestIssuanceReviewContent {...mockProps} />,
    );

    const allTestIds = Array.from(
      container.querySelectorAll("[data-testid]"),
    ).map((el) => el.getAttribute("data-testid"));

    const mainComponentIds = allTestIds.filter((id) => {
      return (
        id === "compliance-heading" ||
        id === "form-report" ||
        id === "earned-credits" ||
        id === "compliance-step-buttons"
      );
    });

    expect(mainComponentIds).toEqual([
      "compliance-heading",
      "form-report",
      "earned-credits",
      "compliance-step-buttons",
    ]);
  });
});
