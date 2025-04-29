import { render, screen } from "@testing-library/react";
import { describe, expect, vi } from "vitest";
import { RequestIssuanceOfEarnedCreditsContent } from "../../../../../app/components/compliance-summary/request-issuance/request-issuance-of-earned-credits/RequestIssuanceOfEarnedCreditsContent";
import { RequestIssuanceData } from "../../../../../app/utils/getRequestIssuanceData";

vi.mock(
  "../../../../../app/components/compliance-summary/ComplianceHeading",
  () => ({
    ComplianceHeading: ({ title }: { title: string }) => (
      <div data-testid="compliance-heading">{title}</div>
    ),
  }),
);

vi.mock(
  "../../../../../app/components/compliance-summary/request-issuance/request-issuance-of-earned-credits/CarbonRegistryAccountInfo",
  () => ({
    default: ({ data }: { data: RequestIssuanceData }) => (
      <div data-testid="carbon-registry-account-info">
        {data.bccrTradingName}
      </div>
    ),
  }),
);

vi.mock("@bciers/components/form/components/ComplianceStepButtons", () => ({
  default: (props: any) => (
    <div data-testid="compliance-step-buttons">
      {props.backUrl && <div data-testid="back-url">{props.backUrl}</div>}
      <div data-testid="continue-url">{props.continueUrl}</div>
      <div data-testid="continue-button-text">{props.continueButtonText}</div>
    </div>
  ),
}));

describe("RequestIssuanceOfEarnedCreditsContent", () => {
  const mockData: RequestIssuanceData = {
    bccrTradingName: "Test Trading Name",
    validBccrHoldingAccountId: "123456789012345",
    reportingYear: 2023,
    operation_name: "Test Operation",
  };

  const mockProps = {
    continueUrl: "/test-continue-url",
    backUrl: "/test-back-url",
    data: mockData,
    complianceSummaryId: 123,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the component with the correct title", () => {
    render(<RequestIssuanceOfEarnedCreditsContent {...mockProps} />);

    expect(screen.getByTestId("compliance-heading")).toHaveTextContent(
      "Request Issuance of Earned Credits",
    );
  });

  it("passes the correct data to CarbonRegistryAccountInfo", () => {
    render(<RequestIssuanceOfEarnedCreditsContent {...mockProps} />);

    expect(
      screen.getByTestId("carbon-registry-account-info"),
    ).toHaveTextContent(mockData.bccrTradingName);
  });

  it("renders ComplianceStepButtons with correct props", () => {
    render(<RequestIssuanceOfEarnedCreditsContent {...mockProps} />);

    expect(screen.getByTestId("back-url")).toHaveTextContent(mockProps.backUrl);
    expect(screen.getByTestId("continue-url")).toHaveTextContent(
      mockProps.continueUrl,
    );
    expect(screen.getByTestId("continue-button-text")).toHaveTextContent(
      "Requests Issuance of Earned Credits",
    );
  });

  it("renders without backUrl", () => {
    const propsWithoutBackUrl = {
      ...mockProps,
      backUrl: undefined,
    };

    render(<RequestIssuanceOfEarnedCreditsContent {...propsWithoutBackUrl} />);

    expect(screen.queryByTestId("back-url")).toBeNull();

    expect(screen.getByTestId("continue-url")).toHaveTextContent(
      mockProps.continueUrl,
    );
  });
});
