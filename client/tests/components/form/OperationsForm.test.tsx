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

const mocks = vi.hoisted(() => {
  return {
    useRouter: vi.fn(),
    useParams: vi.fn(),
  };
});

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

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    query: { operation: "025328a0-f9e8-4e1a-888d-aa192cb053db" },
  }),
  useParams: () => ({
    formSection: "1",
    operation: "025328a0-f9e8-4e1a-888d-aa192cb053db",
  }),
}));

vi.mock("next/navigation", () => {
  return {
    useRouter: mocks.useRouter,
    useParams: mocks.useParams,
  };
});

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(() => Promise.resolve()),
  revalidatePath: vi.fn(() => Promise.resolve()),
}));

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
    fetchMock.resetMocks();
    fetchMock.enableMocks();
  });

  it("renders the empty OperationsForm when no formData is passed", async () => {
    mocks.useRouter.mockReturnValue({
      query: { operation: "create" },
      replace: vi.fn(),
    });
    mocks.useParams.mockReturnValue({
      formSection: "1",
      operation: "create",
    });

    render(
      <SessionProvider>
        <OperationsForm schema={testOperationSchema} formData={{}} />
      </SessionProvider>,
    );

    // Test for the Operation Information form heaer
    expect(screen.getByTestId("field-template-label")).toBeVisible();
    // Operation Name
    expect(screen.getByLabelText(/Operation Name+/i)).toHaveValue("");

    // // Operation Type
    expect(screen.getByLabelText(/Operation Type+/i)).toHaveValue(""); // Select widget returns undefined when empty */

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
    mocks.useRouter.mockReturnValue({
      query: { operation: "test-id" },
      replace: vi.fn(),
    });
    mocks.useParams.mockReturnValue({
      formSection: "1",
      operation: "test-id",
    });

    render(
      <SessionProvider>
        <OperationsForm schema={testOperationSchema} formData={mockFormData} />
      </SessionProvider>,
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
    // TODO: Find a better way to test the multi-select widget/mui autocomplete
    // Just verifying that the option in the form data is visible
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

  it("shows the success message when operationName is defined", async () => {
    mocks.useRouter.mockReturnValue({
      query: { operation: "test-id" },
      replace: vi.fn(),
    });
    mocks.useParams.mockReturnValue({
      formSection: "3",
      operation: "test-id",
    });

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
          name: "Operation 1",
        }),
      );
    });

    // TODO: Find alternate way to wait for the success message to appear
    await act(async () => {
      setTimeout(() => {}, 1000);
    });

    // Get the success message using the text content since it returns broken up text error
    expect(
      screen.getByText(
        (_, element) =>
          element?.textContent ===
          "Your application for the B.C. OBPS Regulated Operation ID for Operation 1 has been received.",
      ),
    ).toBeInTheDocument();
  });
});
