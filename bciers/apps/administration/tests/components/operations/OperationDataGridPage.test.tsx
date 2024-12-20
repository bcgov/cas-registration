import { render, screen } from "@testing-library/react";
import { useRouter, useSearchParams } from "@bciers/testConfig/mocks";
import Operations from "@/administration/app/components/operations/OperationDataGridPage";
import { auth } from "@bciers/testConfig/mocks";
import { fetchOperationsPageData } from "./mocks";

useRouter.mockReturnValue({
  query: {},
  replace: vi.fn(),
});

useSearchParams.mockReturnValue({
  get: vi.fn(),
});

const mockResponse = {
  data: [
    {
      id: 1,
      operator: "FakeOperator",
      name: "Operation 1",
      bcghg_id: "12111130001",
      type: "Single Facility Operation",
      status: "Draft",
      bc_obps_regulated_operation: "N/A",
    },
    {
      id: 2,
      operator: "FakeOperator",
      name: "Operation 2",
      bcghg_id: "12111130002",
      type: "Linear Facility Operation",
      status: "Registered",
      bc_obps_regulated_operation: "24-0001",
    },
  ],
  row_count: 2,
};

describe("Operations component", () => {
  beforeEach(async () => {
    vi.resetAllMocks();
    useRouter.mockReturnValue({
      query: {},
      replace: vi.fn(),
    });

    useSearchParams.mockReturnValue({
      get: vi.fn(),
    });
  });

  it("throws an error when there's a problem fetching data", async () => {
    auth.mockReturnValueOnce({
      user: { app_role: "cas_director" },
    });
    fetchOperationsPageData.mockReturnValueOnce(undefined);
    await expect(async () => {
      render(await Operations({ searchParams: {} }));
    }).rejects.toThrow("Failed to retrieve operations");
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
  });

  it("renders the OperationDataGrid component  when there are operations in the database", async () => {
    auth.mockReturnValueOnce({
      user: { app_role: "industry_user" },
    });
    fetchOperationsPageData.mockReturnValueOnce(mockResponse);
    render(await Operations({ searchParams: {} }));
    expect(screen.getByRole("grid")).toBeVisible();
    expect(
      screen.queryByText(/No operations data in database./i),
    ).not.toBeInTheDocument();
  });
});
