import { render, screen } from "@testing-library/react";
import {
  useRouter,
  useSearchParams,
  useSession,
  notFound,
} from "@bciers/testConfig/mocks";
import { getBusinessStructures, getCurrentOperator } from "./mocks";
import Operator from "../../../../administration/app/components/operators/Operator";

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

useRouter.mockReturnValue({
  query: {},
  replace: vi.fn(),
});

describe("Operator component", () => {
  beforeEach(async () => {
    vi.resetAllMocks();
  });

  it("renders the not found page when given a bad operator id", async () => {
    getCurrentOperator.mockReturnValueOnce({
      error: "not real",
    });
    render(await Operator());
    expect(notFound).toHaveBeenCalled();
  });

  it("renders an error if there's a problem fetching business structures", async () => {
    getCurrentOperator.mockReturnValueOnce({
      id: "8be4c7aa-6ab3-4aad-9206-0ef914fea063",
    });
    getBusinessStructures.mockReturnValueOnce({
      error: "yikes",
    });
    render(await Operator());
    expect(notFound).toHaveBeenCalled();
  });

  it("renders the operator form with form data", async () => {
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
    render(await Operator());
    expect(screen.getByText(/Test Operator Name/i)).toBeVisible();
    expect(screen.getByText(/BC Corporation/i)).toBeVisible();
  });
});
