"use client";

import { useMemo, useState } from "react";
import DataGrid from "@bciers/components/datagrid/DataGrid";
import HeaderSearchCell from "@bciers/components/datagrid/cells/HeaderSearchCell";
import operationGroupColumns from "@bciers/components/datagrid/models/operationGroupColumns";
import { fetchOperationsPageData } from "./Operations";
import operationColumns from "../datagrid/models/operationColumns";
import { OperationRow } from "./types";

const ReportingOperationDataGrid = ({
  initialData,
}: {
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

  const columns = operationColumns();

  const columnGroup = useMemo(
    () => operationGroupColumns(false, SearchCell),
    [SearchCell],
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

export default ReportingOperationDataGrid;
