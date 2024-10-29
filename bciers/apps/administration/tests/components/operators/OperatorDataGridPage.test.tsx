import { render, screen } from "@testing-library/react";
import {
  fetchOperatorsPageData,
  useRouter,
  useSearchParams,
} from "@bciers/testConfig/mocks";
import Operators from "apps/administration/app/components/operators/OperatorDataGridPage";

useRouter.mockReturnValue({
  query: {},
  replace: vi.fn(),
});

useSearchParams.mockReturnValue({
  get: vi.fn(),
});

const mockResponse = {
  rows: [
    {
      id: 1,
      legal_name: "Operator 1 Legal Name",
      business_structure: "Sole Proprietorship",
      cra_business_number: "123456789",
      bc_corporate_registry_number: "abc1234567",
    },
    {
      id: 2,
      legal_name: "Existing Operator 2 Legal Name",
      business_structure: "General Partnership",
      cra_business_number: "123456789",
      bc_corporate_registry_number: "def1234567",
    },
    {
      id: 3,
      legal_name: "New Operator 3 Legal Name",
      business_structure: "BC Corporation",
      cra_business_number: "123456789",
      bc_corporate_registry_number: "ghi1234567",
    },
  ],
  row_count: 2,
};

vi.mock(
  "apps/administration/app/components/operators/fetchOperatorsPageData",
  () => ({
    default: fetchOperatorsPageData,
  }),
);

describe("OperatorDataGridPage component", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  it("renders a message when there are no operators in the database", async () => {
    fetchOperatorsPageData.mockReturnValueOnce(undefined);
    render(await Operators({ searchParams: {} }));
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
    expect(screen.getByText(/No operator data in database./i)).toBeVisible();
  });

  it("renders the OperatorDataGrid component when there are operators in the database", async () => {
    fetchOperatorsPageData.mockReturnValueOnce(mockResponse);
    render(await Operators({ searchParams: {} }));
    expect(screen.getByRole("grid")).toBeVisible();
    expect(
      screen.queryByText(/No operator data in database./i),
    ).not.toBeInTheDocument();
  });
});
