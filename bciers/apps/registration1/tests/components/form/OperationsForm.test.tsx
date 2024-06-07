import { operationSchema } from "@/app/utils/jsonSchema/operations";
import { act, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, vi } from "vitest";
import React from "react";
import {
  actionHandler,
  useSession,
  useParams,
  useRouter,
} from "@bciers/testConfig/mocks";
import { QueryParams, Router, Session } from "@bciers/testConfig/types";
import { createOperationSchema } from "@/app/components/operations/Operation";
import OperationsForm from "@/app/components/operations/OperationsForm";

useSession.mockReturnValue({
  data: {
    user: {
      app_role: "industry_user_admin",
    },
  },
} as Session);

const mockFormData = {
  id: "025328a0-f9e8-4e1a-888d-aa192cb053db",
  name: "Operation 1",
  type: "Single Facility Operation",
  opt_in: false,
  regulated_products: [1],
  previous_year_attributable_emissions: null,
  status: "Draft",
  naics_code_id: 1,
  first_name: "John",
  last_name: "Doe",
  email: "john.doe@example.com",
  phone_number: "+16044011234",
  position_title: "Senior Officer",
  street_address: "123 Main St",
  municipality: "Cityville",
  province: "ON",
  postal_code: "A1B 2C3",
  statutory_declaration: "data:text/plain;base64,SGVsbG8gV29ybGQ=",
  bc_obps_regulated_operation: null,
  bcghg_id: "23219990001",
  external_point_of_contact_first_name: "John",
  external_point_of_contact_last_name: "Doe",
  external_point_of_contact_email: "john.doe@example.com",
  external_point_of_contact_phone_number: "+16044011234",
  external_point_of_contact_position_title: "Senior Officer",
  "Did you submit a GHG emissions report for reporting year 2022?": false,
  is_external_point_of_contact: true,
  multiple_operators_array: [{}],
};

const testOperationSchema = createOperationSchema(
  operationSchema,
  [
    {
      id: 1,
      naics_code: "211110",
      naics_description: "Oil and gas extraction (except oil sands)",
    },
  ],
  [
    { id: 1, name: "BC-specific refinery complexity throughput" },
    { id: 2, name: "Cement equivalent" },
    { id: 3, name: "Chemicals: pure hydrogen peroxide" },
  ],
  [],
);

describe("Operations component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the empty OperationsForm when no formData is passed", async () => {
    useRouter.mockReturnValue({
      query: { operation: "create", formSection: "1" },
      replace: vi.fn(),
    } as Router);
    useParams.mockReturnValue({
      formSection: "1",
      operation: "create",
    } as QueryParams);

    render(<OperationsForm schema={testOperationSchema} formData={{}} />);

    // Test for the Operation Information form here
    expect(screen.getByTestId("field-template-label")).toBeVisible();
    // Operation Name
    expect(screen.getByLabelText(/Operation Name+/i)).toHaveValue("");

    // // Operation Type
    expect(screen.getByLabelText(/Operation Type+/i)).toHaveValue("");

    // Primary NAICS Code
    expect(screen.getByLabelText(/Primary NAICS Code+/i)).toHaveValue("");

    // Bcghg ID
    expect(screen.getByLabelText(/BCGHG ID/i)).toHaveValue("");

    // Submit button
    expect(
      screen.getByRole("button", { name: /Save and Continue/i }),
    ).toBeInTheDocument();
  });

  it("loads an existing OperationsForm", async () => {
    render(
      <OperationsForm schema={testOperationSchema} formData={mockFormData} />,
    );

    // Operation Name
    expect(screen.getByLabelText(/Operation Name+/i)).toHaveValue(
      "Operation 1",
    );

    // // Operation Type
    expect(screen.getByLabelText(/Operation Type+/i)).toHaveValue(
      "Single Facility Operation",
    );

    // Primary NAICS Code
    expect(screen.getByLabelText(/Primary NAICS Code+/i)).toHaveValue(
      "211110 - Oil and gas extraction (except oil sands)",
    );

    // Regulated product names
    expect(
      screen.getByText("BC-specific refinery complexity throughput"),
    ).toBeVisible();
    // Bcghg ID
    expect(screen.getByLabelText(/BCGHG ID/i)).toHaveValue("23219990001");

    // Submit button
    expect(
      screen.getByRole("button", { name: /Save and continue/i }),
    ).toBeInTheDocument();
  });

  it("shows the received message when operationName is defined", async () => {
    useParams.mockReturnValue({
      formSection: "3",
      operation: "test-id",
    } as QueryParams);

    render(
      <OperationsForm schema={testOperationSchema} formData={mockFormData} />,
    );

    const submitButton = screen.getByText(/Submit/i);

    act(() => {
      submitButton.click();
      actionHandler.mockReturnValueOnce({
        id: "025328a0-f9e8-4e1a-888d-aa192cb053db",
        name: "Operation 1",
        error: null,
      });
    });

    // Get the success message using the text content since it returns broken up text error
    await waitFor(() => {
      expect(
        screen.getByText(
          (_, element) =>
            element?.textContent ===
            "Your application for the B.C. OBPS Regulated Operation ID for Operation 1 has been received.",
        ),
      ).toBeVisible();
    });
  });

  it("shows the saved message when an operation that already has a BORO ID and is updated", async () => {
    useParams.mockReturnValue({
      formSection: "3",
      operation: "test-id",
    } as QueryParams);

    render(
      <OperationsForm
        schema={testOperationSchema}
        formData={{ ...mockFormData, bc_obps_regulated_operation: "21-0005" }}
      />,
    );

    const submitButton = screen.getByText(/Submit/i);

    act(() => {
      submitButton.click();
      actionHandler.mockReturnValueOnce({
        id: "025328a0-f9e8-4e1a-888d-aa192cb053db",
        name: "Operation 1",
        error: null,
      });
    });

    // Get the success message using the text content since it returns broken up text error
    await waitFor(() => {
      expect(
        screen.getByText(
          (_, element) =>
            element?.textContent === "Your changes have been saved.",
        ),
      ).toBeVisible();
    });
  });
});
