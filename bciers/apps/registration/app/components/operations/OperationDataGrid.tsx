"use client";

import { memo, useMemo, useState } from "react";
import DataGrid from "@bciers/components/datagrid/DataGrid";
import OperationsActionCell from "@bciers/components/datagrid/cells/OperationsActionCell";
import HeaderSearchCell from "@bciers/components/datagrid/cells/HeaderSearchCell";
import operationColumns from "../datagrid/models/operationColumns";
import operationGroupColumns from "../datagrid/models/operationGroupColumns";
import { OperationRow } from "./types";
import fetchOperationsPageData from "./fetchOperationsPageData";
import { GridRowParams } from "@mui/x-data-grid";

const OperationDataGrid = ({
  initialData,
  isInternalUser = false,
  onRowClick,
}: {
  isInternalUser?: boolean;
  initialData: {
    rows: OperationRow[];
    row_count: number;
  };
  onRowClick?: (row: GridRowParams) => void;
}) => {
  const [lastFocusedField, setLastFocusedField] = useState<string | null>(null);

  const SearchCell = useMemo(
    () => HeaderSearchCell({ lastFocusedField, setLastFocusedField }),
    [lastFocusedField, setLastFocusedField],
  );

  const ActionCell = useMemo(
    () => OperationsActionCell(!isInternalUser),
    [!isInternalUser],
  );

  const columns = useMemo(
    () => operationColumns(isInternalUser, ActionCell),
    [ActionCell, isInternalUser],
  );

  const columnGroup = useMemo(
    () => operationGroupColumns(isInternalUser, SearchCell),
    [SearchCell, isInternalUser],
  );

  return (
    <DataGrid
      columns={columns}
      onRowClick={onRowClick}
      columnGroupModel={columnGroup}
      fetchPageData={fetchOperationsPageData}
      paginationMode="server"
      initialData={initialData}
    />
  );
};

export default memo(OperationDataGrid);
