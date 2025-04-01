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
import userEvent from "@testing-library/user-event";

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
    },
    {
      id: 2,
      facility__name: "Facility 2",
      facility__type: "Large Facility",
      facility__bcghg_id__id: "1-211113-0002",
      facility__id: 2,
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
    expect(screen.getByRole("columnheader", { name: "Actions" })).toBeVisible();
    expect(screen.queryAllByPlaceholderText(/Search/i)).toHaveLength(3);

    // Check data displays
    expect(screen.getByText(/Facility 1/i)).toBeVisible();
    expect(screen.getByText(/12111130001/i)).toBeVisible();
    expect(screen.getAllByText(/Single Facility/i)).toHaveLength(1);
    expect(screen.getByText(/Facility 2/i)).toBeVisible();
    expect(screen.getByText(/1-211113-0002/i)).toBeVisible();
    expect(screen.getAllByText(/Large Facility/i)).toHaveLength(1);
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
      name: "BC GHG ID",
    });

    act(() => {
      facilityTypeHeader.click();
    });

    expect(
      extractParams(String(mockReplace.mock.calls[2][2]), "sort_field"),
    ).toBe("facility__bcghg_id__id");
    expect(
      extractParams(String(mockReplace.mock.calls[2][2]), "sort_order"),
    ).toBe("asc");

    // click on the same column header again
    act(() => {
      facilityTypeHeader.click();
    });

    expect(
      extractParams(String(mockReplace.mock.calls[3][2]), "sort_field"),
    ).toBe("facility__bcghg_id__id");
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

  it("checks Action Cell links from Registration for new tab behavior and UI", async () => {
    render(
      <FacilityDataGrid
        operationId="randomOperationUUID"
        initialData={mockResponse}
        fromRegistration={true}
      />,
    );

    const actionCells: HTMLSpanElement[] =
      await screen.findAllByText("View Details");
    expect(actionCells).toHaveLength(mockResponse.rows.length);

    actionCells.forEach((actionCell) => {
      const tooltip = actionCell.parentElement;
      expect(tooltip).toHaveAttribute("target", "_blank");
      expect(tooltip).toHaveAttribute("rel", "noopener noreferrer");

      // check for the tooltip text
      userEvent.hover(actionCell);
      waitFor(
        () => {
          expect(screen.findByText(/Link opens in a new tab/i)).toBeVisible();
        },
        {
          timeout: 10000,
        },
      );
    });

    // check for the "open in new tab" icon in the action cells
    expect(screen.getAllByTestId("OpenInNewIcon")).toHaveLength(
      mockResponse.rows.length,
    );
  });

  it("opens Action Cells links in the same tab when coming from Administration module", async () => {
    render(
      <FacilityDataGrid
        operationId="randomOperationUUID"
        initialData={mockResponse}
      />,
    );

    const actionCells = await screen.findAllByText("View Details");
    expect(actionCells).toHaveLength(mockResponse.rows.length);

    actionCells.forEach((actionCell) => {
      expect(actionCell).not.toHaveAttribute("target", "_blank");
      expect(actionCell).not.toHaveAttribute("rel", "noopener noreferrer");
    });

    expect(screen.queryByTestId("OpenInNewIcon")).not.toBeInTheDocument();
  });
});
