import OperationsForm from "@/app/components/form/OperationsForm";
import { createOperationSchema } from "@/app/components/routes/operations/form/Operation";
import { operationSchema } from "@/app/utils/jsonSchema/operations";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import React from "react";

// Mock useFormStatus
jest.mock("react-dom", () => ({
  ...jest.requireActual("react-dom"),
  useFormStatus: jest.fn().mockReturnValue({ pending: false }),
}));

const testFormData = {
  id: 1,
  name: "Operation 1",
  type: "Single Facility Operation",
  naics_code: 45,
  previous_year_attributable_emissions: "1000",
  swrs_facility_id: "1001",
  bcghg_id: "123",
  opt_in: null,
  operator: 1,
  verified_at: "2023-10-13",
  verified_by: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  status: "Not Registered",
  regulated_products: [],
  reporting_activities: [],
  documents: [],
  contacts: [],
  operator_id: 1,
  naics_code_id: 1,
  current_year_estimated_emissions: null,
};

describe("Operations component", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });
  it("renders the empty OperationsForm when no formData is passed", async () => {
    render(<OperationsForm schema={operationSchema} />);

    // Test for Legend elements
    expect(
      screen.getByText(/Step 1: Operation General Information/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Step 2: Operation Operator Information - If operation has multiple operators/i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Step 3: Operation Representative \(OR\) Information/i),
    ).toBeInTheDocument();

    /* Test for Input elements */
    // Operation Name
    expect(screen.getByLabelText(/Operation Name+/i)).toBeInTheDocument();

    // Operation Type
    expect(screen.getByLabelText(/Operation Type+/i)).toBeInTheDocument();

    // Primary NAICS Code
    expect(screen.getByLabelText(/Primary NAICS Code+/i)).toBeInTheDocument();

    // NAICS Category
    expect(screen.getByLabelText(/NAICS Category+/i)).toBeInTheDocument();

    // Regulated Product Name(s)
    expect(
      screen.getByLabelText(/Regulated Product Name\(s\)+/i),
    ).toBeInTheDocument();

    // Reporting Activities
    expect(screen.getByLabelText(/Reporting Activities+/i)).toBeInTheDocument();

    // Process Flow Diagram
    expect(screen.getByLabelText(/Process Flow Diagram+/i)).toBeInTheDocument();

    // Boundary Map
    expect(screen.getByLabelText(/Boundary Map+/i)).toBeInTheDocument();

    // GHG Emissions Report
    expect(
      screen.getByLabelText(
        /Did you submit a GHG emissions report for reporting year 2022\?+/i,
      ),
    ).toBeInTheDocument();

    // Opt-in Operation
    expect(
      screen.getByLabelText(/Is the operation an opt-in operation\?+/i),
    ).toBeInTheDocument();

    // Does the operation have multiple operators?
    expect(
      screen.getByLabelText(/Does the operation have multiple operators\?+/i),
    ).toBeInTheDocument();

    // Would you like to add an exemption ID application lead?
    expect(
      screen.getByLabelText(
        /Would you like to add an exemption ID application lead\?+/i,
      ),
    ).toBeInTheDocument();

    // Submit button
    expect(screen.getByRole("button", { name: /Submit/i })).toBeInTheDocument();
  });

  it("loads an existing OperationsForm", async () => {
    const testOperationSchema = createOperationSchema(
      operationSchema,
      [{ id: 1 }],
      [{ id: 1 }],
    );

    render(
      <OperationsForm schema={testOperationSchema} formData={testFormData} />,
    );

    // Operation Name
    expect(screen.getByLabelText(/Operation Name+/i)).toHaveValue(
      "Operation 1",
    );

    // Operation Type
    expect(screen.getByLabelText(/Operation Type+/i)).toHaveValue("0");

    // Primary NAICS Code
    expect(screen.getByLabelText(/Primary NAICS Code+/i)).toHaveValue("0");

    // NAICS Category
    expect(screen.getByLabelText(/NAICS Category+/i)).toHaveValue("0");

    // Regulated Product Name(s)
    expect(screen.getByLabelText(/Regulated Product Name\(s\)+/i)).toHaveValue(
      "",
    );

    // Reporting Activities
    expect(screen.getByLabelText(/Reporting Activities+/i)).toHaveValue("");

    // Process Flow Diagram
    expect(screen.getByLabelText(/Process Flow Diagram+/i)).toHaveValue("");

    // Boundary Map
    expect(screen.getByLabelText(/Boundary Map+/i)).toHaveValue("");

    // GHG Emissions Report
    expect(
      screen.getByLabelText(
        /Did you submit a GHG emissions report for reporting year 2022\?+/i,
      ),
    ).toHaveValue("0");

    expect(screen.getByLabelText(/2022 attributable emissions/i)).toHaveValue(
      100.345,
    );

    expect(screen.getByLabelText(/SWRS Facility ID/i)).toHaveValue(1001);
    expect(screen.getByLabelText(/BCGHG ID/i)).toHaveValue(123);

    // Does the operation have multiple operators?
    expect(
      screen.getByLabelText(/Does the operation have multiple operators\?+/i),
    ).toHaveValue("1");

    // Would you like to add an exemption ID application lead?
    expect(
      screen.getByLabelText(
        /Would you like to add an exemption ID application lead\?+/i,
      ),
    ).toHaveValue("1");

    // Submit button
    expect(screen.getByRole("button", { name: /Submit/i })).toBeInTheDocument();
  });

  it("shows the success message when operationName is defined", async () => {
    React.useState = jest.fn().mockReturnValue(["Operation 1", {}]);
    render(<OperationsForm schema={operationSchema} />);
    expect(
      screen.getByText(/Your request to register Operation 1/i),
    ).toBeInTheDocument();
  });
});
