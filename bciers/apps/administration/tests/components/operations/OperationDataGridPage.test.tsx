import { render, screen } from "@testing-library/react";
import {
  fetchOperationsPageData,
  useRouter,
  useSearchParams,
} from "@bciers/testConfig/mocks";
import Operations from "@/administration/app/components/operations/OperationDataGridPage";
import { getSessionRole } from "@bciers/testConfig/mocks";
import { OperationTypes } from "@bciers/utils/src/enums";
import { OperationRow } from "@/administration/app/components/operations/types";

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
      operator__legal_name: "FakeOperator",
      operation__name: "Operation 1",
      operation__bcghg_id: "12111130001",
      operation__type: OperationTypes.SFO,
      status: "Draft",
      operation__bc_obps_regulated_operation: "N/A",
    } as OperationRow,
    {
      id: 2,
      operator__legal_name: "FakeOperator",
      operation__name: "Operation 2",
      operation__bcghg_id: "12111130002",
      operation__type: OperationTypes.LFO,
      status: "Registered",
      operation__bc_obps_regulated_operation: "24-0001",
    } as OperationRow,
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

  it("renders the OperationDataGrid component  when there are operations in the database", async () => {
    getSessionRole.mockReturnValue("industry_user");
    fetchOperationsPageData.mockReturnValueOnce(mockResponse);
    render(
      await Operations({
        isInternalUser: true,
        initialData: { rows: [], row_count: 0 },
        filteredSearchParams: {},
      }),
    );
    expect(screen.getByRole("grid")).toBeVisible();
    expect(
      screen.queryByText(/No operations data in database./i),
    ).not.toBeInTheDocument();
  });
});
