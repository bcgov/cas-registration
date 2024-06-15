"use client";

import { useMemo, useState } from "react";
import DataGrid from "@bciers/components/datagrid/DataGrid";
import { GridColumnGroupHeaderParams } from "@mui/x-data-grid";
import OperationsActionCell from "@bciers/components/datagrid/cells/OperationsActionCell";
import HeaderSearchCell from "@bciers/components/datagrid/cells/HeaderSearchCell";
import operationColumns from "../datagrid/models/operationColumns";
import operationGroupColumns from "@bciers/components/datagrid/models/operationGroupColumns";
import { OperationRow } from "./types";
import fetchOperationsPageData from "./fetchOperationsPageData";

const OperationSearchCell = ({
  lastFocusedField,
  setLastFocusedField,
}: {
  lastFocusedField: string | null;
  setLastFocusedField: (value: string | null) => void;
}) => {
  const RenderCell = (params: GridColumnGroupHeaderParams) => {
    const { groupId, headerName } = params;
    return (
      <HeaderSearchCell
        field={groupId ?? ""}
        fieldLabel={headerName ?? ""}
        isFocused={lastFocusedField === groupId}
        setLastFocusedField={setLastFocusedField}
      />
    );
  };
  return RenderCell;
};

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
    () => OperationSearchCell({ lastFocusedField, setLastFocusedField }),
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
      columnGroupModel={columnGroup}
      fetchPageData={fetchOperationsPageData}
      paginationMode="server"
      initialData={initialData}
    />
  );
};

export default OperationDataGrid;
