import { render, screen } from "@testing-library/react";
import OperationInformationPage from "apps/administration/app/components/operations/OperationInformationPage";
import {
  getOperationWithDocuments,
  getNaicsCodes,
  getReportingActivities,
  getBusinessStructures,
  getRegulatedProducts,
} from "./mocks";
import { actionHandler, useSession } from "@bciers/testConfig/mocks";

useSession.mockReturnValue({
  data: {
    user: {
      app_role: "industry_user_admin",
    },
  },
});

const fetchFormEnums = () => {
  // Naics codes
  getNaicsCodes.mockResolvedValue([
    {
      id: 1,
      naics_code: "211110",
      naics_description: "Oil and gas extraction (except oil sands)",
    },
    {
      id: 2,
      naics_code: "212114",
      naics_description: "Bituminous coal mining",
    },
  ]);
  // Reporting activities
  getReportingActivities.mockResolvedValue([
    {
      name: "General stationary combustion excluding line tracing",
      applicable_to: "all",
    },
    { name: "Fuel combustion by mobile equipment", applicable_to: "sfo" },
  ]);

  // Business structures
  getBusinessStructures.mockResolvedValue([
    { name: "General Partnership" },
    { name: "BC Corporation" },
  ]);

  // Regulated products
  getRegulatedProducts.mockResolvedValue([
    { id: 1, name: "BC-specific refinery complexity throughput" },
    { id: 2, name: "Cement equivalent" },
  ]);

  // Registration purposes
  actionHandler.mockResolvedValue(["Potential Reporting Operation"]);
};

const formData = {
  name: "Operation 3",
  type: "Single Facility Operation",
  naics_code_id: 1,
  secondary_naics_code_id: 2,
  operation_has_multiple_operators: true,
  registration_purposes: ["Non-Regulated"],
  multiple_operators_array: [
    {
      mo_is_extraprovincial_company: false,
      mo_legal_name: "Test",
      mo_trade_name: "User",
      mo_business_structure: "BC Corporation",
      mo_cra_business_number: "0123456789",
      mo_bc_corporate_registry_number: "abc0123456",
      mo_attorney_street_address: "test st",
      mo_municipality: "Victoria",
      mo_province: "BC",
      mo_postal_code: "V1V1V1",
    },
  ],
  registration_purpose: "Non-Regulated",
  regulated_products: [6],
};

const operationId = "8be4c7aa-6ab3-4aad-9206-0ef914fea063";

describe("the OperationInformationPage component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("renders the OperationInformationPage component", async () => {
    fetchFormEnums();
    getOperationWithDocuments.mockResolvedValueOnce(formData);
    render(await OperationInformationPage({ operationId }));

    expect(
      screen.getByRole("heading", { name: "Operation Information" }),
    ).toBeVisible();
    expect(screen.getByText(/Operation Name/i)).toBeVisible();
    expect(screen.getByText(/Operation Type/i)).toBeVisible();
    expect(screen.getByText(/Primary NAICS Code/i)).toBeVisible();
    expect(screen.getByText(/Secondary NAICS Code/i)).toBeVisible();
    expect(screen.getByText(/Tertiary NAICS Code/i)).toBeVisible();
    expect(screen.getByText(/Reporting Activities/i)).toBeVisible();
    expect(screen.getByText(/Process Flow Diagram/i)).toBeVisible();
    expect(screen.getByText(/Boundary Map/i)).toBeVisible();

    expect(
      screen.getByRole("heading", { name: "Multiple Operators Information" }),
    ).toBeVisible();
    expect(
      screen.getByText(/Does the operation have multiple operators?/i),
    ).toBeVisible();

    expect(
      screen.getByRole("heading", { name: "Registration Information" }),
    ).toBeVisible();
    expect(
      screen.getByText(/The purpose of this registration+/i),
    ).toBeVisible();
  });

  it("should render the form with the correct values when formData is provided", async () => {
    fetchFormEnums();
    getOperationWithDocuments.mockResolvedValueOnce(formData);

    render(await OperationInformationPage({ operationId }));

    expect(screen.getByText(/Operation 3/i)).toBeVisible();
    expect(screen.getByText(/Single Facility Operation/i)).toBeVisible();
    expect(
      screen.getByText(/211110 - Oil and gas extraction \(except oil sands\)/i),
    ).toBeVisible();
    expect(screen.getByText(/212114 - Bituminous coal mining/i)).toBeVisible();

    // Will add remaining tests for the form fields, though waiting on fix for nesting formData
    // that is coming in another PR since the multiple operators data is not going in
  });
});
