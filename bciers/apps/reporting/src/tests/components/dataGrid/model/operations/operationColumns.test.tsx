import { describe, vi } from "vitest";
import operationColumns from "@reporting/src/app/components/datagrid/models/operations/operationColumns";
import { GridColDef } from "@mui/x-data-grid";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "@bciers/testConfig/mocks";

const mockPush = vi.fn();
useRouter.mockReturnValue({
  push: mockPush,
});

describe("operationColumns function", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  vi.mock("@reporting/src/app/utils/getReportingYear", () => ({
    getReportingYear: vi.fn().mockResolvedValue({ reporting_year: 2023 }),
  }));

  vi.mock("@reporting/src/app/utils/createReport", () => ({
    createReport: vi.fn().mockResolvedValue(1),
  }));

  it("returns an array of column definitions", () => {
    const columns: GridColDef[] = operationColumns();

    assert(columns.length === 5, "Expected 5 columns");

    assert(
      columns[0].field === "bcghg_id",
      'Column 1 field should be "bcghg_id"',
    );
    assert(
      columns[0].headerName === "BC GHG ID",
      'Column 1 headerName should be "BC GHG ID"',
    );
    assert(columns[0].width === 160, "Column 1 width should be 160");

    assert(columns[1].field === "name", 'Column 2 field should be "name"');
    assert(
      columns[1].headerName === "Operation",
      'Column 2 headerName should be "Operation"',
    );
    assert(columns[1].width === 560, "Column 2 width should be 560");

    assert(
      columns[2].field === "report_status",
      'Column 3 field should be "report_status"',
    );
    assert(columns[2].width === 200, "Column 3 width should be 200");

    assert(
      columns[3].field === "report_id",
      'Column 4 field should be "report_id"',
    );
    assert(
      columns[3].headerName === "Actions",
      'Column 4 headerName should be "Actions"',
    );
    assert(columns[3].sortable === false, "Column 4 sortable should be false");
    assert(columns[3].width === 200, "Column 4 width should be 200");

    assert(columns[4].field === "more", 'Column 5 field should be "more"');
    assert(
      columns[4].headerName === "More Actions",
      'Column 5 headerName should be "More Actions"',
    );
    assert(columns[4].sortable === false, "Column 5 sortable should be false");
    assert(columns[4].width === 120, "Column 5 width should be 120");
    assert(columns[4].flex === 1, "Column 5 flex should be 1");
  });

  it("has a 'start' button in the 'Actions' column when report_version_id is null", () => {
    const columns: GridColDef[] = operationColumns();

    const row = {
      id: "2",
      bcghg_id: "12111130002",
      name: "Operation without report",
      report_id: null,
      report_version_id: null,
      report_status: null,
    };

    const params = {
      row,
      value: row.report_version_id,
    };

    function WrapperComponent() {
      const cell = columns[3].renderCell;

      return <div>{cell(params)}</div>;
    }

    render(<WrapperComponent />);
    expect(screen.getByRole("button", { name: "Start" })).toBeInTheDocument();
  });
  it("has a 'continue' button in the 'Actions' column when report_id exists", () => {
    const columns: GridColDef[] = operationColumns();

    const row = {
      id: "1",
      bcghg_id: "12111130002",
      name: "Operation without report",
      report_id: 1,
      report_version_id: 1,
      report_status: "Draft",
    };

    const params = {
      row,
      value: row.report_id,
    };

    function WrapperComponent() {
      const cell = columns[3].renderCell;

      return <div>{cell(params)}</div>;
    }

    render(<WrapperComponent />);
    expect(screen.getByText("Continue")).toBeInTheDocument();
  });

  it("navigates to the matching report page when clicking the 'Continue' button", async () => {
    const user = userEvent.setup();

    const columns = operationColumns();

    const row = {
      id: "1",
      bcghg_id: "12111130002",
      name: "Operation with report",
      report_id: 15,
      report_version_id: 15,
      report_status: "Draft",
    };

    const params = {
      row,
      value: row.report_id,
    };

    function WrapperComponent() {
      const cell = columns[3].renderCell;

      return <div>{cell(params)}</div>;
    }

    render(<WrapperComponent />);
    await user.click(screen.getByText("Continue"));

    expect(mockPush).toHaveBeenCalledWith(`reports/15/review-operator-data`);
  });
});
