import { describe } from "vitest";
import operationColumns from "@reporting/src/app/components/datagrid/models/operationColumns";
import { GridColDef } from "@mui/x-data-grid";

describe("operationColumns function", () => {
  it("returns an array of column definitions", () => {
    const columns: GridColDef[] = operationColumns();

    assert(columns.length === 3, "Expected 3 columns");

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

    assert(columns[2].field === "more", 'Column 3 field should be "action"');
    assert(
      columns[2].headerName === "More",
      'Column 3 headerName should be "More"',
    );
    assert(columns[2].sortable === false, "Column 3 sortable should be false");
    assert(columns[2].width === 120, "Column 3 width should be 120");
    assert(columns[2].flex === 1, "Column 3 flex should be 1");
  });
});
