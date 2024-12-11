import { render, screen } from "@testing-library/react";
import { useRouter, useSearchParams } from "@bciers/testConfig/mocks";
import Operators from "apps/administration/app/components/operators/OperatorDataGridPage";
import { fetchOperatorsPageData } from "@/administration/tests/components/operators/mocks";

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

describe("OperatorDataGridPage component", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  it("throws an error when there's a problem fetching data", async () => {
    fetchOperatorsPageData.mockReturnValueOnce({
      rows: undefined,
      row_count: undefined,
    });
    await expect(async () => {
      render(await Operators({ searchParams: {} }));
    }).rejects.toThrow("Failed to retrieve operators");

    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
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
