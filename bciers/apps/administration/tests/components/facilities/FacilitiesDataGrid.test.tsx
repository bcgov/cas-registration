import "@testing-library/jest-dom";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { useSearchParams } from "@bciers/testConfig/mocks";
import FacilityDataGrid from "apps/administration/app/components/facilities/FacilitiesDataGrid";
import { QueryParams } from "@bciers/testConfig/types";
import extractParams from "@bciers/testConfig/helpers/extractParams";

const mockReplace = vi.spyOn(global.history, "replaceState");

useSearchParams.mockReturnValue({
  get: vi.fn(),
} as QueryParams);

const mockResponse = {
  rows: [
    {
      id: 1,
      facility__name: "Facility 1",
      facility__type: "Single Facility",
      facility__bcghg_id__id: "12111130001",
      facility__id: 1,
      status: "Active",
    },
    {
      id: 2,
      facility__name: "Facility 2",
      facility__type: "Large Facility",
      facility__bcghg_id__id: "1-211113-0002",
      facility__id: 2,
      status: "Active",
    },
  ],
  row_count: 2,
};

describe("FacilitiesDataGrid component", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });
  it("renders the FacilityDataGrid grid", async () => {
    render(
      <FacilityDataGrid
        operationId="randomOperationUUID"
        initialData={mockResponse}
      />,
    );

    // correct headers
    expect(
      screen.getByRole("columnheader", { name: "Facility Name" }),
    ).toBeVisible();
    expect(
      screen.getByRole("columnheader", { name: "Facility Type" }),
    ).toBeVisible();
    expect(
      screen.getByRole("columnheader", { name: "BC GHG ID" }),
    ).toBeVisible();
    expect(screen.getByRole("columnheader", { name: "Status" })).toBeVisible();
    expect(screen.getByRole("columnheader", { name: "Actions" })).toBeVisible();
    expect(screen.queryAllByPlaceholderText(/Search/i)).toHaveLength(4);

    // Check data displays
    expect(screen.getByText(/Facility 1/i)).toBeVisible();
    expect(screen.getByText(/12111130001/i)).toBeVisible();
    expect(screen.getAllByText(/Single Facility/i)).toHaveLength(1);
    expect(screen.getByText(/Facility 2/i)).toBeVisible();
    expect(screen.getByText(/1-211113-0002/i)).toBeVisible();
    expect(screen.getAllByText(/Large Facility/i)).toHaveLength(1);
    // Check status
    expect(screen.getAllByText(/active/i)).toHaveLength(2);
    // Check the number of view details links
    const viewDetailsLinks = screen.getAllByRole("link", {
      name: /View Details/i,
    });
    expect(viewDetailsLinks).toHaveLength(2);
    // we don't care about the exact href, just that it contains the facilityId
    expect(viewDetailsLinks[0]).toHaveAttribute(
      "href",
      "/administration/operations/randomOperationUUID/facilities/1?operations_title=undefined&facilities_title=Facility 1",
    );
    expect(viewDetailsLinks[1]).toHaveAttribute(
      "href",
      "/administration/operations/randomOperationUUID/facilities/2?operations_title=undefined&facilities_title=Facility 2",
    );
  });
  it("makes API call with correct params when sorting", async () => {
    render(
      <FacilityDataGrid
        operationId="randomOperationUUID"
        initialData={mockResponse}
      />,
    );

    // click on the first column header
    const facilityNameHeader = screen.getByRole("columnheader", {
      name: "Facility Name",
    });

    act(() => {
      facilityNameHeader.click();
    });

    expect(
      extractParams(String(mockReplace.mock.calls[0][2]), "sort_field"),
    ).toBe("facility__name");
    expect(
      extractParams(String(mockReplace.mock.calls[0][2]), "sort_order"),
    ).toBe("asc");

    // click on the same column header again
    act(() => {
      facilityNameHeader.click();
    });
    expect(
      extractParams(String(mockReplace.mock.calls[1][2]), "sort_field"),
    ).toBe("facility__name");
    expect(
      extractParams(String(mockReplace.mock.calls[1][2]), "sort_order"),
    ).toBe("desc");

    // click on another column header
    const facilityTypeHeader = screen.getByRole("columnheader", {
      name: "Status",
    });

    act(() => {
      facilityTypeHeader.click();
    });

    expect(
      extractParams(String(mockReplace.mock.calls[2][2]), "sort_field"),
    ).toBe("status");
    expect(
      extractParams(String(mockReplace.mock.calls[2][2]), "sort_order"),
    ).toBe("asc");

    // click on the same column header again
    act(() => {
      facilityTypeHeader.click();
    });

    expect(
      extractParams(String(mockReplace.mock.calls[3][2]), "sort_field"),
    ).toBe("status");
    expect(
      extractParams(String(mockReplace.mock.calls[3][2]), "sort_order"),
    ).toBe("desc");
  });

  it("makes API call with correct params when filtering", async () => {
    render(
      <FacilityDataGrid
        operationId="randomOperationUUID"
        initialData={mockResponse}
      />,
    );

    const searchInput = screen.getAllByPlaceholderText(/Search/i)[0]; // facility name search input
    expect(searchInput).toBeVisible();
    searchInput.focus();
    act(() => {
      fireEvent.change(searchInput, { target: { value: "facility 1" } });
    });
    expect(searchInput).toHaveValue("facility 1");

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalled();
    });

    await waitFor(() => {
      // check that the API call was made with the correct params
      expect(
        extractParams(String(mockReplace.mock.calls), "facility__name"),
      ).toBe("facility 1");
    });
  });
});
