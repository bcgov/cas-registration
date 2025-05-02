import { render, screen } from "@testing-library/react";
import CarbonRegistryAccountInfo from "@/compliance/src/app/components/compliance-summary/request-issuance/request-issuance-of-earned-credits/CarbonRegistryAccountInfo";
import * as schemaModule from "@/compliance/src/app/utils/carbonRegistryAccountSchema";
import { RequestIssuanceData } from "@/compliance/src/app/utils/getRequestIssuanceData";

vi.mock("@/compliance/src/app/utils/carbonRegistryAccountSchema", async () => {
  const actual = await vi.importActual(
    "@/compliance/src/app/utils/carbonRegistryAccountSchema",
  );
  return {
    ...actual,
    buildCarbonRegistryAccountSchema: vi.fn().mockImplementation(() => ({
      type: "object",
      properties: {
        bccrTradingName: {
          type: "string",
          title: "BCCR Trading Name:",
        },
        bccrHoldingAccountId: {
          type: "string",
          title: "BCCR Holding Account ID:",
        },
      },
    })),
    buildCarbonRegistryAccountUiSchema: vi.fn().mockImplementation(() => ({
      "ui:classNames": "w-full",
      "ui:submitButtonOptions": {
        norender: true,
      },
      "ui:order": ["bccrHoldingAccountId", "bccrTradingName"],
    })),
  };
});

vi.mock("@mui/material", async () => {
  const actual = await vi.importActual("@mui/material");
  return {
    ...actual,
    Box: vi
      .fn()
      .mockImplementation(
        ({ className, children, "data-component": dataComponent }) => (
          <div
            className={className}
            data-component={dataComponent}
            data-testid="mui-box"
          >
            {children}
          </div>
        ),
      ),
    GlobalStyles: vi.fn().mockImplementation(() => null),
  };
});

vi.mock("@bciers/components/form/FormBase", () => ({
  default: vi
    .fn()
    .mockImplementation(({ schema, uiSchema, formData, onChange }) => {
      return (
        <div data-testid="form-base">
          <div data-testid="form-schema">{JSON.stringify(schema)}</div>
          <div data-testid="form-ui-schema">{JSON.stringify(uiSchema)}</div>
          <div data-testid="form-data">{JSON.stringify(formData)}</div>
          <input
            data-testid="bccr-holding-account-id"
            type="text"
            value={formData.bccrHoldingAccountId ?? ""}
            onChange={(e) => {
              const newFormData = {
                ...formData,
                bccrHoldingAccountId: e.target.value,
              };
              onChange({ formData: newFormData });
            }}
          />
          <input
            data-testid="bccr-trading-name"
            type="text"
            value={formData.bccrTradingName ?? ""}
            onChange={(e) => {
              const newFormData = {
                ...formData,
                bccrTradingName: e.target.value,
              };
              onChange({ formData: newFormData });
            }}
          />
        </div>
      );
    }),
}));

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
