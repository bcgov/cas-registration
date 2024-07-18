import { describe } from "vitest";
import operationColumns from "@reporting/src/app/components/datagrid/models/operationColumns";
import { GridColDef } from "@mui/x-data-grid";

describe("operationColumns function", () => {
  it("returns an array of column definitions", () => {
    const columns: GridColDef[] = operationColumns();

    assert(columns.length === 4, "Expected 4 columns");

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
      columns[2].field === "report_id",
      'Column 3 field should be "report_id"',
    );
    assert(
      columns[2].headerName === "Actions",
      'Column 3 headerName should be "Actions"',
    );
    assert(columns[2].width === 120, "Column 3 width should be 120");

    assert(columns[3].field === "more", 'Column 4 field should be "action"');
    assert(
      columns[3].headerName === "More",
      'Column 4 headerName should be "More"',
    );
    assert(columns[3].sortable === false, "Column 4 sortable should be false");
    assert(columns[3].width === 120, "Column 4 width should be 120");
    assert(columns[3].flex === 1, "Column 4 flex should be 1");
  });

  it("has a 'start' button in the 'Actions' column when report_id is null", () => {
    const columns: GridColDef[] = operationColumns();

    const row = {
      id: "1",
      bcghg_id: "1",
      name: "Operation without report",
      report_id: null,
      report_version_id: null,
      report_status: null,
    };

    const params = {
      row,
      value: null,
    };

    const cell = columns[2].renderCell(params);
    expect(cell.props.children).toBe("Start");
  });

  it("has a 'continue' button in the 'Actions' column when report_id exists", () => {
    const columns: GridColDef[] = operationColumns();

    const row = {
      id: "1",
      bcghg_id: "1",
      name: "Operation with report",
      report_id: 1,
      report_version_id: 1,
      report_status: "draft",
    };

    const params = {
      row,
      value: 1,
    };

    const cell = columns[2].renderCell(params);
    expect(cell.props.children).toBe("Continue");
  });

});
