import { render, screen } from "@testing-library/react";
import {
  fetchFacilitiesPageData,
  useRouter,
  useSearchParams,
} from "@bciers/testConfig/mocks";
import Facilities from "apps/administration/app/components/facilities/Facilities";

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
      name: "Facility 1",
      type: "Single Facility",
      bcghg_id: "12111130001",
    },
    {
      id: 2,
      name: "Facility 2",
      type: "Large Facility",
      bcghg_id: "12111130002",
    },
  ],
  row_count: 2,
};

describe("Facilities component", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  it("renders a message when there are no facilities in the database", async () => {
    fetchFacilitiesPageData.mockResolvedValueOnce(undefined);
    render(
      await Facilities({
        operationId: "randomOperationUUID",
        searchParams: {},
      }),
    );
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
    expect(screen.getByText(/No facilities data in database./i)).toBeVisible();
  });

  it("renders the FacilityDataGrid component when there are facilities in the database", async () => {
    fetchFacilitiesPageData.mockResolvedValueOnce(mockResponse);
    render(
      await Facilities({
        operationId: "randomOperationUUID",
        searchParams: {},
      }),
    );
    expect(screen.getByRole("grid")).toBeVisible();
    expect(
      screen.queryByText(/No operations data in database./i),
    ).not.toBeInTheDocument();
  });
});
