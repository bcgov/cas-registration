import { render, screen } from "@testing-library/react";
import {
  auth,
  useRouter,
  useSearchParams,
  useSession,
} from "@bciers/testConfig/mocks";
import { mockUseSession } from "@bciers/testConfig/helpers/mockUseSession";
import { getBusinessStructures, getCurrentOperator } from "./mocks";
import OperatorPage from "apps/administration/app/components/operators/OperatorPage";

useRouter.mockReturnValue({
  query: {},
  replace: vi.fn(),
});

useSearchParams.mockReturnValue({
  get: vi.fn(),
});

useSession.mockReturnValue({
  get: vi.fn(),
});

describe("Operator component", () => {
  beforeEach(async () => {
    vi.resetAllMocks();
  });
  it("renders the appropriate error component when getCurrentOperator fails", async () => {
    auth.mockReturnValueOnce({
      user: { app_role: "industry_user_admin" },
    });
    getCurrentOperator.mockReturnValueOnce({
      error: "no operator found",
    });
    await expect(async () => {
      render(await OperatorPage());
    }).rejects.toThrow("Failed to retrieve operator information");
  });
  it("renders the appropriate error component when getBusinessStructures fails", async () => {
    auth.mockReturnValueOnce({
      user: { app_role: "industry_user_admin" },
    });
    getCurrentOperator.mockReturnValueOnce({
      id: "8be4c7aa-6ab3-4aad-9206-0ef914fea063",
    });
    getBusinessStructures.mockReturnValueOnce({
      error: "no business structures",
    });
    await expect(async () => {
      render(await OperatorPage());
    }).rejects.toThrow("Failed to retrieve business structure information");
  });
  it("renders the operator form with form data", async () => {
    // Mock auth (which is different from session data)
    auth.mockReturnValueOnce({
      user: { app_role: "industry_user_admin" },
    });
    // Mock the session data
    mockUseSession();
    getCurrentOperator.mockReturnValueOnce({
      street_address: "123 Main St",
      municipality: "City",
      province: "ON",
      postal_code: "A1B 2C3",
      operator_has_parent_operators: true,
      parent_operators_array: [
        {
          po_legal_name: "Parent Operator Legal Name",
          po_cra_business_number: 123456780,
          po_street_address: "789 Oak St",
          po_municipality: "Village",
          po_province: "BC",
          po_postal_code: "M2N 3P4",
          operator_registered_in_canada: true,
          po_mailing_address: 4,
          foreign_address: null,
          foreign_tax_id_number: null,
          id: 1,
        },
        {
          po_legal_name: "Parent Operator Legal Name",
          po_cra_business_number: 123456780,
          po_street_address: "789 Oak St",
          po_municipality: "Village",
          po_province: "BC",
          po_postal_code: "M2N 3P4",
          operator_registered_in_canada: true,
          po_mailing_address: 6,
          foreign_address: null,
          foreign_tax_id_number: null,
          id: 2,
        },
      ],
      partner_operators_array: null,
      id: "4242ea9d-b917-4129-93c2-db00b7451051",
      legal_name: "Test Operator Name",
      trade_name: "bloop",
      business_structure: "BC Corporation",
      cra_business_number: 987654321,
      bc_corporate_registry_number: "def1234567",
      mailing_address: 5,
    });
    getBusinessStructures.mockReturnValueOnce([
      { name: "General Partnership" },
      { name: "BC Corporation" },
      { name: "Extra Provincially Registered Company" },
      { name: "Sole Proprietorship" },
      { name: "Limited Liability Partnership" },
      { name: "BC Incorporated Society" },
      { name: "Extraprovincial Non-Share Corporation" },
    ]);
    render(await OperatorPage());
    expect(screen.getByText(/Test Operator Name/i)).toBeVisible();
    expect(screen.getByText(/BC Corporation/i)).toBeVisible();
  });
  it("renders the operator form for adding a new operator", async () => {
    auth.mockReturnValueOnce({
      user: { app_role: "industry_user_admin" },
    });
    // Mock the session data
    mockUseSession();
    // Mock getBusinessStructures for create mode
    getBusinessStructures.mockReturnValueOnce([
      { name: "General Partnership" },
      { name: "BC Corporation" },
      { name: "Extra Provincially Registered Company" },
    ]);

    // Render the page with isCreating set to true
    render(await OperatorPage({ isCreating: true }));

    // Check that the form is in create mode (no operator details present)
    expect(screen.getByText(/Legal Name/i)).toBeVisible();
    const legalNameInput = screen.getByLabelText(/Legal Name/i);
    expect(legalNameInput).toBeVisible();
    expect(legalNameInput).toHaveValue("");
  });
});
