import "@testing-library/jest-dom";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { useRouter, useSearchParams } from "@bciers/testConfig/mocks";
import FacilityDataGrid from "apps/administration/app/components/facilities/FacilityDataGrid";
import { QueryParams } from "@bciers/testConfig/types";
import extractParams from "../helpers/extractParams";

const mockReplace = vi.fn();
useRouter.mockReturnValue({
  query: {},
  replace: mockReplace,
});

useSearchParams.mockReturnValue({
  get: vi.fn(),
} as QueryParams);

const mockResponse = {
  rows: [
    {
      id: 1,
      name: "Facility 1",
      type: "Single Facility",
      bcghg_id: "1-211113-0001",
    },
    {
      id: 2,
      name: "Facility 2",
      type: "Large Facility",
      bcghg_id: "1-211113-0002",
    },
  ],
  row_count: 2,
};

describe("OperationsDataGrid component", () => {
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
    expect(screen.getByRole("columnheader", { name: "Actions" })).toBeVisible();
    expect(screen.queryAllByPlaceholderText(/Search/i)).toHaveLength(3);

    // Check data displays
    expect(screen.getByText(/Facility 1/i)).toBeVisible();
    expect(screen.getByText(/1-211113-0001/i)).toBeVisible();
    expect(screen.getAllByText(/Single Facility/i)).toHaveLength(1);
    expect(screen.getByText(/Facility 2/i)).toBeVisible();
    expect(screen.getByText(/1-211113-0002/i)).toBeVisible();
    expect(screen.getAllByText(/Large Facility/i)).toHaveLength(1);
    // Check the number of view details links
    expect(screen.getAllByRole("link", { name: /View Details/i })).toHaveLength(
      2,
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
    facilityNameHeader.click();

    expect(extractParams(mockReplace.mock.calls[1], "sort_field")).toBe("name");
    expect(extractParams(mockReplace.mock.calls[1], "sort_order")).toBe("asc");

    // click on the same column header again
    facilityNameHeader.click();
    expect(extractParams(mockReplace.mock.calls[2], "sort_field")).toBe("name");
    expect(extractParams(mockReplace.mock.calls[2], "sort_order")).toBe("desc");

    // click on the second column header
    const facilityTypeHeader = screen.getByRole("columnheader", {
      name: "Facility Type",
    });
    facilityTypeHeader.click();
    expect(extractParams(mockReplace.mock.calls[3], "sort_field")).toBe("type");
    expect(extractParams(mockReplace.mock.calls[3], "sort_order")).toBe("asc");

    // click on the same column header again
    facilityTypeHeader.click();
    expect(extractParams(mockReplace.mock.calls[4], "sort_field")).toBe("type");
    expect(extractParams(mockReplace.mock.calls[4], "sort_order")).toBe("desc");
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

    // check that the API call was made with the correct params
    expect(extractParams(mockReplace.mock.calls[1], "name")).toBe("facility 1");
  });
});