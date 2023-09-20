"use client";

import * as React from "react";

import {
  DataGrid as MuiGrid,
  GridRowsProp,
  GridColDef,
} from "@mui/x-data-grid";

interface Props {
  rows: GridRowsProp;
  columns: GridColDef[];
}

const DataGrid: React.FunctionComponent<Props> = ({ rows, columns }) => {
  return (
    <div style={{ height: "auto", width: "90%" }}>
      <MuiGrid rows={rows} columns={columns} />
    </div>
  );
};
export default DataGrid;
