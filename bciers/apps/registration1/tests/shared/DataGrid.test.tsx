import { act, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, vi } from "vitest";
import { useSearchParams } from "@bciers/testConfig/mocks";
import { QueryParams } from "@bciers/testConfig/types";
import DataGrid from "@bciers/components/datagrid/DataGrid";
import { GridColDef } from "@mui/x-data-grid";

const extractParams = (mockCall: string, paramToExtract: string) => {
  const decodedQueryParams = decodeURIComponent(mockCall);
  const params = new URLSearchParams(decodedQueryParams);
  return params.get(paramToExtract);
};

useSearchParams.mockReturnValue({
  get: vi.fn(),
} as QueryParams);

const defaultInitialData = {
  rows: [
    {
      id: 1,
      col1: "value1",
      col2: "value2",
      col3: "value3",
    },
    {
      id: 2,
      col1: "unicorn",
      col2: "dragon",
      col3: "mermaid",
    },
  ],
  row_count: 1,
};
const defaultColumns = [
  { field: "col1" },
  { field: "col2" },
  { field: "col3" },
] as GridColDef[];

const paginationTestData = {
  rows: Array.from({ length: 25 }, (_, index) => ({
    id: index + 1,
    col1: Math.random(),
    col2: Math.random(),
    col3: Math.random(),
  })),
  row_count: 25,
};

const paginationTestColumns = Array.from({ length: 25 }, (_, index) => ({
  field: `col${index + 1}`,
})) as GridColDef[];

const mockReplace = vi.spyOn(global.history, "replaceState");

describe("The DataGrid component", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  it("renders the correct data when initialData and columns (not columnGroupData) are given", async () => {
    render(
      <DataGrid
        columns={defaultColumns}
        initialData={defaultInitialData}
        columnGroupModel={[]}
      />,
    );
    expect(screen.getAllByRole("columnheader")).toHaveLength(3);
    expect(screen.getAllByRole("row")).toHaveLength(3); // two rows because one is the headers
    expect(screen.getAllByRole("gridcell")[0]).toHaveTextContent("value1");
    expect(screen.getAllByRole("gridcell")[1]).toHaveTextContent("value2");
    expect(screen.getAllByRole("gridcell")[2]).toHaveTextContent("value3");
    expect(screen.getAllByRole("gridcell")[3]).toHaveTextContent("unicorn");
    expect(screen.getAllByRole("gridcell")[4]).toHaveTextContent("dragon");
    expect(screen.getAllByRole("gridcell")[5]).toHaveTextContent("mermaid");
  });
  it("renders an empty grid with overlay when no data", async () => {
    render(
      <DataGrid
        columns={defaultColumns}
        initialData={{ rows: [], row_count: 0 }}
      />,
    );
    expect(screen.getAllByRole("columnheader")).toHaveLength(3);
    expect(screen.getAllByRole("row")).toHaveLength(1);
    expect(screen.getByText(/No records found/i)).toBeInTheDocument();
  });

  it("sorts the column data and updates the URL", async () => {
    render(
      <DataGrid columns={defaultColumns} initialData={defaultInitialData} />,
    );
    expect(screen.getAllByRole("gridcell")[0]).toHaveTextContent("value1");
    expect(screen.getAllByRole("gridcell")[3]).toHaveTextContent("unicorn");

    // sort ascending
    act(() => {
      screen.getAllByLabelText("Sort")[0].click();
    });
    expect(mockReplace).toHaveBeenCalledTimes(1);

    expect(
      extractParams(String(mockReplace.mock.calls[0][2]), "sort_field"),
    ).toBe("col1");
    expect(
      extractParams(String(mockReplace.mock.calls[0][2]), "sort_order"),
    ).toBe("asc");

    await waitFor(() => {
      expect(screen.getAllByRole("gridcell")[0]).toHaveTextContent("unicorn");
      expect(screen.getAllByRole("gridcell")[3]).toHaveTextContent("value1");
    });

    // sort descending
    act(() => {
      screen.getAllByLabelText("Sort")[0].click();
    });
    expect(mockReplace).toHaveBeenCalledTimes(2);

    expect(
      extractParams(String(mockReplace.mock.calls[1][2]), "sort_field"),
    ).toBe("col1");
    expect(
      extractParams(String(mockReplace.mock.calls[1][2]), "sort_order"),
    ).toBe("desc");

    // unsort
    act(() => {
      screen.getAllByLabelText("Sort")[0].click();
    });
    expect(mockReplace).toHaveBeenCalledTimes(3);

    await waitFor(() => {
      expect(
        extractParams(String(mockReplace.mock.calls[2][2]), "sort_field"),
      ).toBe(null);
      expect(
        extractParams(String(mockReplace.mock.calls[2][2]), "sort_order"),
      ).toBe(null);
    });
  });

  it("adds the page to the URL to support server-side pagination", async () => {
    render(
      <DataGrid
        columns={paginationTestColumns}
        initialData={paginationTestData}
        paginationMode="server"
      />,
    );
    expect(screen.getAllByRole("row")).toHaveLength(26); // pagination is controlled by the server, so the grid will show everything the server returns (mocking 20+ rows to confirm this)
    act(() => {
      screen.getByLabelText("Go to next page").click();
    });

    expect(mockReplace).toHaveBeenCalledTimes(1);
    expect(extractParams(String(mockReplace.mock.calls[0][2]), "page")).toBe(
      "2",
    );
  });
});
