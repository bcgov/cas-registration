"use client";

import { useMemo, useState } from "react";
import DataGrid from "@bciers/components/datagrid/DataGrid";
import OperationsActionCell from "@bciers/components/datagrid/cells/OperationsActionCell";
import HeaderSearchCell from "@bciers/components/datagrid/cells/HeaderSearchCell";
import operationColumns from "../datagrid/models/operationColumns";
import operationGroupColumns from "../datagrid/models/operationGroupColumns";
import { OperationRow } from "./types";
import fetchOperationsPageData from "./fetchOperationsPageData";

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
    () => operationColumns(isInternalUser, OperationsActionCell()),
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
