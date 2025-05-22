import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, vi } from "vitest";
import { TrackStatusOfIssuanceContent } from "../../../../../app/components/compliance-summary/request-issuance/track-status-of-issuance/TrackStatusOfIssuanceContent";
import { IssuanceStatus } from "../../../../../app/utils/getRequestIssuanceTrackStatusData";

vi.mock(
  "../../../../../app/components/compliance-summary/ComplianceHeading",
  () => ({
    ComplianceHeading: ({ title }: any) => (
      <h2
        aria-label="compliance heading"
        data-component-name="compliance-heading"
      >
        {title}
      </h2>
    ),
  }),
);

vi.mock(
  "../../../../../app/components/compliance-summary/request-issuance/track-status-of-issuance/StatusOfIssuance",
  () => ({
    StatusOfIssuance: ({ data }: any) => (
      <section
        aria-label="status of issuance"
        data-component-name="status-of-issuance"
        data-issuance-props={JSON.stringify(data)}
      >
        Status of Issuance Component
      </section>
    ),
  }),
);

vi.mock("@bciers/components/form/components/ComplianceStepButtons", () => ({
  __esModule: true,
  default: ({
    backUrl,
    backButtonDisabled,
    submitButtonDisabled,
    style,
  }: any) => (
    <nav
      aria-label="compliance step buttons"
      data-component-name="compliance-step-buttons"
      data-back-url={backUrl}
      data-back-disabled={backButtonDisabled.toString()}
      data-submit-disabled={submitButtonDisabled.toString()}
      style={style}
    >
      Compliance Step Buttons
    </nav>
  ),
}));

describe("TrackStatusOfIssuanceContent", () => {
  const mockProps = {
    backUrl: "/test-back-url",
    data: {
      operation_name: "Test Operation",
      earnedCredits: 100,
      issuanceStatus: IssuanceStatus.APPROVED,
      bccrTradingName: "Test Trading Name",
      directorsComments: "Director's test comments",
    },
    complianceSummaryId: 123,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the component with the correct title", () => {
    render(<TrackStatusOfIssuanceContent {...mockProps} />);

    expect(screen.getByLabelText("compliance heading")).toHaveTextContent(
      "Track Status of Issuance",
    );
  });

  it("renders the StatusOfIssuance component with correct data", () => {
    render(<TrackStatusOfIssuanceContent {...mockProps} />);

    const statusOfIssuance = screen.getByLabelText("status of issuance");
    expect(statusOfIssuance).toBeVisible();

    const passedData = JSON.parse(
      statusOfIssuance.getAttribute("data-issuance-props") ?? "{}",
    );
    expect(passedData).toEqual(mockProps.data);
  });

  it("renders the ComplianceStepButtons with correct props", () => {
    render(<TrackStatusOfIssuanceContent {...mockProps} />);

    const buttons = screen.getByLabelText("compliance step buttons");
    expect(buttons).toBeVisible();

    expect(buttons.getAttribute("data-back-url")).toBe(mockProps.backUrl);
    expect(buttons.getAttribute("data-back-disabled")).toBe("false");
    expect(buttons.getAttribute("data-submit-disabled")).toBe("false");

    expect(buttons).toHaveStyle({ marginTop: "170px" });
  });

  it("handles missing backUrl gracefully", () => {
    const { backUrl, ...propsWithoutBackUrl } = mockProps;

    render(<TrackStatusOfIssuanceContent {...propsWithoutBackUrl} />);

    const buttons = screen.getByLabelText("compliance step buttons");
    expect(buttons.getAttribute("data-back-url")).toBe(null);
  });

  it("renders all components in the correct order", () => {
    const { container } = render(
      <TrackStatusOfIssuanceContent {...mockProps} />,
    );

    const allComponentNames = Array.from(
      container.querySelectorAll("[data-component-name]"),
    ).map((el) => el.getAttribute("data-component-name"));

    const mainComponentNames = allComponentNames.filter((name) => {
      return (
        name === "compliance-heading" ||
        name === "status-of-issuance" ||
        name === "compliance-step-buttons"
      );
    });

    expect(mainComponentNames).toEqual([
      "compliance-heading",
      "status-of-issuance",
      "compliance-step-buttons",
    ]);
  });
});
