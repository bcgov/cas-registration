import { render, screen, within } from "@testing-library/react";
import { WidgetProps } from "@rjsf/utils";
import ApplyComplianceUnitsWidget from "@/compliance/src/app/widgets/ApplyComplianceUnitsWidget";
import { BccrUnit } from "@/compliance/src/app/types";
import { useSearchParams } from "@bciers/testConfig/mocks";
import { fireEvent } from "@testing-library/react";

useSearchParams.mockReturnValue({
  get: vi.fn(),
});

const mockUnits: BccrUnit[] = [
  {
    id: "1",
    type: "Earned Credits",
    serial_number:
      "BC-BCO-IN-104100000030260-01012025-31122039-21887521-21888518-SPG",
    vintage_year: 2025,
    quantity_available: 100,
    quantity_to_be_applied: 0,
    equivalent_emission_reduced: 0,
    equivalent_value: 0,
  },
  {
    id: "2",
    type: "Offset Units",
    serial_number:
      "BC-BCO-IN-104100000030260-01012024-31122039-21887521-21888518-SPG",
    vintage_year: 2024,
    quantity_available: 200,
    quantity_to_be_applied: 0,
    equivalent_emission_reduced: 0,
    equivalent_value: 0,
  },
];

const defaultProps = {
  value: mockUnits,
  formContext: {
    chargeRate: 40,
    complianceLimitStatus: "BELOW" as const,
  },
} as unknown as WidgetProps;

describe("ApplyComplianceUnitsWidget", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders DataGrid with correct column headers", () => {
    render(<ApplyComplianceUnitsWidget {...defaultProps} />);

    const headers = screen.getAllByRole("columnheader");
    expect(headers).toHaveLength(7);
    expect(headers[0]).toHaveTextContent("Type");
    expect(headers[1]).toHaveTextContent("Serial Number");
    expect(headers[2]).toHaveTextContent("Vintage Year");
    expect(headers[3]).toHaveTextContent("Quantity Available");
    expect(headers[4]).toHaveTextContent("Quantity to be Applied");
    expect(headers[5]).toHaveTextContent("Equivalent Emission Reduced");
    expect(headers[6]).toHaveTextContent("Equivalent Value");
  });

  it("displays unit data correctly in the grid", () => {
    render(<ApplyComplianceUnitsWidget {...defaultProps} />);

    const rows = screen.getAllByRole("row").slice(1); // Skip header row
    const firstRow = within(rows[0]);
    const secondRow = within(rows[1]);

    // Check first unit data
    expect(firstRow.getByText("Earned Credits")).toBeVisible();
    expect(
      firstRow.getByText(
        "BC-BCO-IN-104100000030260-01012025-31122039-21887521-21888518-SPG",
      ),
    ).toBeVisible();
    expect(firstRow.getByText("2025")).toBeVisible();
    expect(firstRow.getByText("100")).toBeVisible();
    expect(firstRow.getByLabelText("quantity_to_be_applied")).toHaveValue("0"); // Input field for quantity to be applied
    expect(firstRow.getByText("0 tCO2e")).toBeVisible();
    expect(firstRow.getByText("$0.00")).toBeVisible();

    // Check second unit data
    expect(secondRow.getByText("Offset Units")).toBeVisible();
    expect(
      secondRow.getByText(
        "BC-BCO-IN-104100000030260-01012024-31122039-21887521-21888518-SPG",
      ),
    ).toBeVisible();
    expect(secondRow.getByText("2024")).toBeVisible();
    expect(secondRow.getByText("200")).toBeVisible();
    expect(secondRow.getByLabelText("quantity_to_be_applied")).toHaveValue("0"); // Input field for quantity to be applied
    expect(secondRow.getByText("0 tCO2e")).toBeVisible();
    expect(secondRow.getByText("$0.00")).toBeVisible();
  });

  it("shows compliance limit message when status is EXCEEDS", () => {
    const props = {
      ...defaultProps,
      formContext: {
        ...defaultProps.formContext,
        complianceLimitStatus: "EXCEEDS" as const,
      },
    };

    render(<ApplyComplianceUnitsWidget {...props} />);

    expect(
      screen.getByText(
        /at least 50% of the compliance obligation must be met with monetary payment\(s\)\. the compliance units \(earned credits, offset units\) you selected below have exceeded the limit, please reduce the quantity to be applied to proceed\./i,
      ),
    ).toBeVisible();
  });

  it("shows compliance limit message when status is EQUALS", () => {
    const props = {
      ...defaultProps,
      formContext: {
        ...defaultProps.formContext,
        complianceLimitStatus: "EQUALS" as const,
      },
    };

    render(<ApplyComplianceUnitsWidget {...props} />);

    expect(
      screen.getByText(
        /the compliance units \(earned credits, offset units\) you selected below have reached 50% of the compliance obligation\. the remaining balance must be met with monetary payment\(s\)\./i,
      ),
    ).toBeVisible();
  });

  it("does not show compliance limit message when status is BELOW", () => {
    render(<ApplyComplianceUnitsWidget {...defaultProps} />);

    expect(screen.queryByText(/compliance obligation/)).not.toBeInTheDocument();
  });

  it("formats equivalent value using charge rate", () => {
    const props = {
      ...defaultProps,
      value: [
        {
          ...mockUnits[0],
          quantity_to_be_applied: 50,
        },
      ],
      formContext: {
        ...defaultProps.formContext,
        chargeRate: 50,
      },
    };

    render(<ApplyComplianceUnitsWidget {...props} />);

    // Check formatted value (50 units * $50 charge rate = $2,500)
    expect(screen.getByText("$2,500.00")).toBeVisible();
  });

  it("returns 0 tCO2e when quantity_to_be_applied is not set", () => {
    const props = {
      ...defaultProps,
      value: [
        {
          ...mockUnits[0],
          quantity_to_be_applied: undefined,
        },
      ],
    };

    render(<ApplyComplianceUnitsWidget {...props} />);
    expect(screen.getByText("0 tCO2e")).toBeVisible();
  });

  it("returns quantity_to_be_applied value with tCO2e unit", () => {
    const props = {
      ...defaultProps,
      value: [
        {
          ...mockUnits[0],
          quantity_to_be_applied: 75,
        },
      ],
    };

    render(<ApplyComplianceUnitsWidget {...props} />);
    expect(screen.getByText("75 tCO2e")).toBeVisible();
  });

  it("calculates equivalent value based on quantity_to_be_applied and charge rate", () => {
    const props = {
      ...defaultProps,
      value: [
        {
          ...mockUnits[0],
          quantity_to_be_applied: 50,
        },
      ],
      formContext: {
        ...defaultProps.formContext,
        chargeRate: 40,
      },
    };

    render(<ApplyComplianceUnitsWidget {...props} />);
    // 50 units * $40 charge rate = $2,000
    expect(screen.getByText("$2,000.00")).toBeVisible();
  });

  it("formats equivalent value as currency with correct calculation", () => {
    const props = {
      ...defaultProps,
      value: [
        {
          ...mockUnits[0],
          quantity_to_be_applied: 100,
        },
      ],
      formContext: {
        ...defaultProps.formContext,
        chargeRate: 40,
      },
    };

    render(<ApplyComplianceUnitsWidget {...props} />);
    // 100 units * $40 charge rate = $4,000
    expect(screen.getByText("$4,000.00")).toBeVisible();
  });

  it("returns $0.00 when quantity_to_be_applied is 0", () => {
    const props = {
      ...defaultProps,
      value: [
        {
          ...mockUnits[0],
          quantity_to_be_applied: 0,
        },
      ],
    };

    render(<ApplyComplianceUnitsWidget {...props} />);
    expect(screen.getByText("$0.00")).toBeVisible();
  });

  it("calls onChange when quantity to be applied input changes", () => {
    const onChange = vi.fn();
    const props = {
      ...defaultProps,
      onChange,
    };

    render(<ApplyComplianceUnitsWidget {...props} />);

    const rows = screen.getAllByRole("row").slice(1); // Skip header row
    const firstRow = within(rows[0]);
    const input = firstRow.getByLabelText("quantity_to_be_applied");
    fireEvent.change(input, { target: { value: "50" } });

    expect(onChange).toHaveBeenCalledWith([
      {
        ...mockUnits[0],
        quantity_to_be_applied: 50,
      },
      mockUnits[1],
    ]);
  });
});
