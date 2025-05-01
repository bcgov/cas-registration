import { render, screen } from "@testing-library/react";
import { CarbonRegistryAccountInfo } from "@/compliance/src/app/components/compliance-summary/request-issuance/request-issuance-of-earned-credits/CarbonRegistryAccountInfo";
import * as schemaModule from "@/compliance/src/app/utils/carbonRegistryAccountSchema";
import { RequestIssuanceData } from "@/compliance/src/app/utils/getRequestIssuanceData";


// Spy on the schema module functions instead of mocking them completely
vi.spyOn(schemaModule, "buildCarbonRegistryAccountSchema");
vi.spyOn(schemaModule, "buildCarbonRegistryAccountUiSchema");

describe("CarbonRegistryAccountInfo", () => {
  const mockData: RequestIssuanceData = {
    reportingYear: 2023,
    operation_name: "Operation 2",
    bccrTradingName: "Colour Co.",
    validBccrHoldingAccountId: "123456789012345",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with the correct title", () => {
    render(<CarbonRegistryAccountInfo data={mockData} />);

    // Check that the component renders with the correct title
    expect(
      screen.getByText("B.C. Carbon Registry (BCCR) Account Information"),
    ).toBeInTheDocument();
  });

  it("calls the correct schema builder functions with appropriate arguments", () => {
    render(<CarbonRegistryAccountInfo data={mockData} />);

    // Verify the schema builder functions were called with the right arguments
    expect(schemaModule.buildCarbonRegistryAccountSchema).toHaveBeenCalledTimes(
      1,
    );
    expect(
      schemaModule.buildCarbonRegistryAccountUiSchema,
    ).toHaveBeenCalledWith(mockData);
  });

  it("renders form fields for BCCR account information", () => {
    render(<CarbonRegistryAccountInfo data={mockData} />);
    
    // Check that the form contains the expected field labels
    // This tests the integration with the schema without testing implementation details
    expect(screen.getByText(/BCCR Trading Name/i)).toBeVisible();
    expect(screen.getByText(/BCCR Holding Account ID/i)).toBeVisible();
  });
});