import { render, screen } from "@testing-library/react";
import {
  fetchOperationsPageData,
  useRouter,
  useSearchParams,
} from "@bciers/testConfig/mocks";
import Operations from "@/administration/app/components/operations/OperationDataGridPage";

useRouter.mockReturnValue({
  query: {},
  replace: vi.fn(),
});

useSearchParams.mockReturnValue({
  get: vi.fn(),
});

vi.mock(
  "apps/administration/app/components/operations/fetchOperationsPageData",
  () => ({
    default: fetchOperationsPageData,
  }),
);

const mockResponse = {
  data: [
    {
      id: 1,
      operator: "FakeOperator",
      name: "Operation 1",
      bcghg_id: "1-211113-0001",
      type: "Single Facility Operation",
      status: "Draft",
      bc_obps_regulated_operation: "N/A",
    },
    {
      id: 2,
      operator: "FakeOperator",
      name: "Operation 2",
      bcghg_id: "2",
      type: "Linear Facility Operation",
      status: "Registered",
      bc_obps_regulated_operation: "24-0001",
    },
  ],
  row_count: 2,
};

describe("Operations component", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  it("renders a message when there are no operations in the database", async () => {
    fetchOperationsPageData.mockReturnValueOnce(undefined);
    render(await Operations({ searchParams: {} }));
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
    expect(screen.getByText(/No operations data in database./i)).toBeVisible();
  });

  it("renders the OperationDataGrid component when there are operations in the database", async () => {
    fetchOperationsPageData.mockReturnValueOnce(mockResponse);
    render(await Operations({ searchParams: {} }));
    expect(screen.getByRole("grid")).toBeVisible();
    expect(
      screen.queryByText(/No operations data in database./i),
    ).not.toBeInTheDocument();
  });
});
