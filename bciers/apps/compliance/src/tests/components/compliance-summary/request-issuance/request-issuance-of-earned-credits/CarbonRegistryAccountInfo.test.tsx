import { render, screen, fireEvent } from "@testing-library/react";
import { CarbonRegistryAccountInfo } from "@/compliance/src/app/components/compliance-summary/request-issuance/request-issuance-of-earned-credits/CarbonRegistryAccountInfo";
import * as schemaModule from "@/compliance/src/app/utils/carbonRegistryAccountSchema";
import { RequestIssuanceData } from "@/compliance/src/app/utils/getRequestIssuanceData";

vi.spyOn(schemaModule, "buildCarbonRegistryAccountSchema");
vi.spyOn(schemaModule, "buildCarbonRegistryAccountUiSchema");

describe("CarbonRegistryAccountInfo", () => {
  const mockData: RequestIssuanceData = {
    reportingYear: 2023,
    operation_name: "Operation 2",
    bccrTradingName: "Colour Co.",
    bccrHoldingAccountId: "123456789012345",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with the correct title", () => {
    render(<CarbonRegistryAccountInfo data={mockData} />);

    expect(
      screen.getByText("B.C. Carbon Registry (BCCR) Account Information"),
    ).toBeInTheDocument();
  });

  it("calls the correct schema builder functions with appropriate arguments", () => {
    render(<CarbonRegistryAccountInfo data={mockData} />);

    expect(schemaModule.buildCarbonRegistryAccountSchema).toHaveBeenCalledTimes(
      1,
    );
    expect(
      schemaModule.buildCarbonRegistryAccountUiSchema,
    ).toHaveBeenCalledWith(mockData);
  });

  it("renders form fields for BCCR account information", () => {
    render(<CarbonRegistryAccountInfo data={mockData} />);

    expect(screen.getByText(/BCCR Holding Account ID:/i)).toBeVisible();

    expect(screen.getByText(/Create account/i)).toBeVisible();

    expect(
      screen.getByText("B.C. Carbon Registry (BCCR) Account Information"),
    ).toBeVisible();

    expect(screen.queryByText(/BCCR Trading Name:/i)).not.toBeInTheDocument();
  });

  it("displays BCCR Trading Name when the correct account ID is entered", () => {
    render(<CarbonRegistryAccountInfo data={mockData} />);

    const accountIdInput = screen.getByLabelText(/BCCR Holding Account ID:/i);

    fireEvent.change(accountIdInput, {
      target: { value: mockData.bccrHoldingAccountId },
    });

    expect(screen.getByText(/BCCR Trading Name:/i)).toBeVisible();

    expect(screen.getByText(mockData.bccrTradingName)).toBeVisible();
  });
});
