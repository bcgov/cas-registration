import OperationsForm from "@/app/components/form/OperationsForm";
import { createOperationSchema } from "@/app/components/routes/operations/form/Operation";
import { operationSchema } from "@/app/utils/jsonSchema/operations";
import createFetchMock from "vitest-fetch-mock";
import { act, render, screen } from "@testing-library/react";
import { SessionProvider } from "next-auth/react";
import { describe, expect, vi } from "vitest";
import React from "react";

const fetchMock = createFetchMock(vi);
fetchMock.enableMocks();

// Mock useFormStatus
vi.mock("react-dom", () => ({
  useFormStatus: jest.fn().mockReturnValue({ pending: false }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    query: { operation: "create" },
  }),
  useParams: () => ({
    formSection: "1",
    operation: "create",
  }),
}));

vi.mock("next-auth/react", async (importOriginal) => {
  const actual = importOriginal();
  return {
    ...actual,
    useSession: vi.fn(() => ({
      data: {
        user: {
          app_role: "industry_admin",
        },
      },
    })),
    SessionProvider: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
  };
});

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(() => Promise.resolve()),
  revalidatePath: vi.fn(() => Promise.resolve()),
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
  status: "Not Started",
  regulated_products: [],
  reporting_activities: [],
  contacts: [],
  operator_id: 1,
  naics_code_id: 1,
  current_year_estimated_emissions: null,
};

const testOperationSchema = createOperationSchema(
  operationSchema,
  [{ id: 1, naics_code: "string", naics_description: "string" }],
  [{ id: 1, name: "string" }],
  [{ id: "test-id", label: "string" }],
);

// TODO: Remove skip and fix this test
describe("Operations component", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    fetchMock.resetMocks();
    fetchMock.enableMocks();
  });
  it.skip("renders the empty OperationsForm when no formData is passed", async () => {
    render(
      <SessionProvider>
        <OperationsForm schema={testOperationSchema} />
      </SessionProvider>,
    );

    // Test for Legend elements
    expect(
      screen.getByText(/Step 1: Operation Information/i),
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

    // Would you like to add an exemption ID point of contact?
    expect(
      screen.getByLabelText(
        /Would you like to add an exemption ID point of contact\?+/i,
      ),
    ).toBeInTheDocument();

    // Submit button
    expect(screen.getByRole("button", { name: /Submit/i })).toBeInTheDocument();
  });

  it.skip("loads an existing OperationsForm", async () => {
    render(
      <SessionProvider>
        <OperationsForm schema={testOperationSchema} formData={testFormData} />
      </SessionProvider>,
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

    // Would you like to add an exemption ID point of contact?
    expect(
      screen.getByLabelText(
        /Would you like to add an exemption ID point of contact\?+/i,
      ),
    ).toHaveValue("1");

    // Submit button
    expect(screen.getByRole("button", { name: /Submit/i })).toBeInTheDocument();
  });

  it("shows the success message when operationName is defined", async () => {
    vi.mock("next/navigation", () => ({
      useRouter: () => ({
        query: { operation: "test-id" },
        replace: vi.fn(),
      }),
      useParams: () => ({
        formSection: "3",
        operation: "test-id",
      }),
    }));

    const mockFormData = {
      id: "025328a0-f9e8-4e1a-888d-aa192cb053db",
      name: "Operation 5",
      type: "Single Facility Operation",
      opt_in: false,
      regulated_products: [],
      previous_year_attributable_emissions: null,
      status: "Draft",
      naics_code_id: 21,
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

    render(
      <SessionProvider>
        <OperationsForm schema={testOperationSchema} formData={mockFormData} />
      </SessionProvider>,
    );

    const submitButton = screen.getByText(/Submit/i);

    act(() => {
      submitButton.click();
    });

    act(() => {
      fetchMock.mockResponseOnce(
        JSON.stringify({
          id: "025328a0-f9e8-4e1a-888d-aa192cb053db",
          name: "Operation 5",
        }),
      );
    });

    // TODO: Find alternate way to wait for the success message to appea
    await act(async () => {
      setTimeout(() => {}, 1000);
    });

    // Get the success message using the text content since it returns broken up text error
    expect(
      screen.getByText(
        (_, element) =>
          element?.textContent ===
          "Your application for the B.C. OBPS Regulated Operation ID for Operation 5 has been received.",
      ),
    ).toBeInTheDocument();
  });
});
