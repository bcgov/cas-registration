import { render, screen } from "@testing-library/react";
import { CarbonRegistryAccountInfo } from "@/compliance/src/app/components/compliance-summary/request-issuance/request-issuance-of-earned-credits/CarbonRegistryAccountInfo";

vi.mock("@/compliance/src/app/utils/carbonRegistryAccountSchema", () => ({
  requestIssuanceOfEarnedCreditsSchema: {
    type: "object",
    title: "B.C. Carbon Registry (BCCR) Account Information",
    properties: {
      bccrHoldingAccountId: {
        type: "string",
        title: "BCCR Holding Account ID:",
      },
      bccrTradingName: { type: "string", title: "BCCR Trading Name:" },
    },
  },
  requestIssuanceOfEarnedCreditsUiSchema: {
    "ui:options": { labelOverrideStyle: "text-bc-bg-blue my-4" },
  },
}));

describe("CarbonRegistryAccountInfo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with the correct title", () => {
    render(<CarbonRegistryAccountInfo />);

    expect(
      screen.getByText("B.C. Carbon Registry (BCCR) Account Information"),
    ).toBeInTheDocument();
  });

  it("renders form fields for BCCR account information", () => {
    render(<CarbonRegistryAccountInfo />);

    expect(screen.getByText(/BCCR Holding Account ID:/i)).toBeVisible();

    expect(
      screen.getByText("B.C. Carbon Registry (BCCR) Account Information"),
    ).toBeVisible();
  });
});
