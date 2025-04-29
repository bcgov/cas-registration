import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { CarbonRegistryAccountInfo } from "../../../../../app/components/compliance-summary/request-issuance/request-issuance-of-earned-credits/CarbonRegistryAccountInfo";
import * as schemaModule from "../../../../../app/utils/carbonRegistryAccountSchema";
import { RequestIssuanceData } from "../../../../../app/utils/getRequestIssuanceData";

vi.mock("../../../../../app/utils/carbonRegistryAccountSchema", async () => {
  const actual = await vi.importActual(
    "../../../../../app/utils/carbonRegistryAccountSchema",
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
  __esModule: true,
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
            value={formData.bccrHoldingAccountId || ""}
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
            value={formData.bccrTradingName || ""}
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

  const mockOnValidationChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with the correct schema and UI schema", () => {
    render(
      <CarbonRegistryAccountInfo
        data={mockData}
        onValidationChange={mockOnValidationChange}
      />,
    );

    expect(screen.getByTestId("form-base")).toBeInTheDocument();

    expect(
      schemaModule.buildCarbonRegistryAccountSchema,
    ).toHaveBeenCalledWith();
    expect(
      schemaModule.buildCarbonRegistryAccountUiSchema,
    ).toHaveBeenCalledWith(mockData);
  });

  it("initializes with empty form data", () => {
    render(
      <CarbonRegistryAccountInfo
        data={mockData}
        onValidationChange={mockOnValidationChange}
      />,
    );

    const formDataElement = screen.getByTestId("form-data");
    const formData = JSON.parse(formDataElement.textContent || "{}");

    expect(formData).toEqual({
      bccrHoldingAccountId: "",
      bccrTradingName: "",
    });
  });

  it("validates holding account ID correctly", async () => {
    render(
      <CarbonRegistryAccountInfo
        data={mockData}
        onValidationChange={mockOnValidationChange}
      />,
    );

    const holdingAccountInput = screen.getByTestId("bccr-holding-account-id");
    fireEvent.change(holdingAccountInput, {
      target: { value: mockData.validBccrHoldingAccountId },
    });

    await waitFor(() => {
      expect(mockOnValidationChange).toHaveBeenCalledWith(true);
    });

    fireEvent.change(holdingAccountInput, { target: { value: "12345" } });

    await waitFor(() => {
      expect(mockOnValidationChange).toHaveBeenCalledWith(false);
    });
  });

  it("validates trading name correctly", async () => {
    render(
      <CarbonRegistryAccountInfo
        data={mockData}
        onValidationChange={mockOnValidationChange}
      />,
    );

    const holdingAccountInput = screen.getByTestId("bccr-holding-account-id");
    fireEvent.change(holdingAccountInput, {
      target: { value: mockData.validBccrHoldingAccountId },
    });

    const tradingNameInput = screen.getByTestId("bccr-trading-name");
    fireEvent.change(tradingNameInput, {
      target: { value: mockData.bccrTradingName },
    });

    await waitFor(() => {
      expect(mockOnValidationChange).toHaveBeenCalledWith(true);
    });

    fireEvent.change(tradingNameInput, {
      target: { value: "Wrong Trading Name" },
    });

    await waitFor(() => {
      expect(mockOnValidationChange).toHaveBeenCalledWith(false);
    });
  });

  it("works without onValidationChange callback", async () => {
    render(<CarbonRegistryAccountInfo data={mockData} />);

    const holdingAccountInput = screen.getByTestId("bccr-holding-account-id");
    fireEvent.change(holdingAccountInput, {
      target: { value: mockData.validBccrHoldingAccountId },
    });

    await waitFor(() => {
      expect(screen.getByTestId("form-base")).toBeInTheDocument();
    });
  });

  it("applies the correct styling with data-component attribute", () => {
    render(<CarbonRegistryAccountInfo data={mockData} />);

    const container = screen.getByTestId("mui-box");
    expect(container).toHaveAttribute(
      "data-component",
      "carbon-registry-account-info",
    );
    expect(container).toHaveClass("mt-[20px]");
    expect(container).toHaveClass("w-full");
  });
});
