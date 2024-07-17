"use client";

import { useMemo, useState } from "react";
import DataGrid from "@bciers/components/datagrid/DataGrid";
import OperationsActionCell from "@bciers/components/datagrid/cells/OperationsActionCell";
import HeaderSearchCell from "@bciers/components/datagrid/cells/HeaderSearchCell";
import operationColumns from "../datagrid/models/operationColumns";
import operationGroupColumns from "../datagrid/models/operationGroupColumns";
import { OperationRow } from "./types";
import ActionCellFactory from "@bciers/components/datagrid/cells/ActionCellFactory";
import fetchOperationsPageData from "./fetchOperationsPageData";
import { GridRenderCellParams } from "@mui/x-data-grid";

const FacilitiesActionCell = ActionCellFactory({
  generateHref: (params: GridRenderCellParams) => {
    return `operations/${params.row.id}/facilities?operationsTitle=${params.row.operator}`;
  },
  replace: true,
  cellText: "View Facilities",
});

const OperationDataGrid = ({
  initialData,
  isInternalUser = false,
}: {
  isInternalUser?: boolean;
  initialData: {
    rows: OperationRow[];
    row_count: number;
  };
}) => {
  const [lastFocusedField, setLastFocusedField] = useState<string | null>(null);

  const SearchCell = useMemo(
    () => HeaderSearchCell({ lastFocusedField, setLastFocusedField }),
    [lastFocusedField, setLastFocusedField],
  );

  const columns = useMemo(
    () =>
      operationColumns(
        isInternalUser,
        OperationsActionCell(),
        FacilitiesActionCell,
      ),
    [OperationsActionCell, isInternalUser],
  );

  const columnGroup = useMemo(
    () => operationGroupColumns(isInternalUser, SearchCell),
    [SearchCell, isInternalUser],
  );

  return (
    <DataGrid
      columns={columns}
      columnGroupModel={columnGroup}
      fetchPageData={fetchOperationsPageData}
      paginationMode="server"
      initialData={initialData}
    />
  );
};

export default OperationDataGrid;
