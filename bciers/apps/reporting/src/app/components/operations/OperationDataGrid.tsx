"use client";

import { useMemo, useState } from "react";
import DataGrid from "@bciers/components/datagrid/DataGrid";
import HeaderSearchCell from "@bciers/components/datagrid/cells/HeaderSearchCell";
import operationGroupColumns from "@reporting/src/app/components/datagrid/models/operations/operationGroupColumns";
import { fetchOperationsPageData } from "./fetchOperationsPageData";
import operationColumns from "@reporting/src/app/components/datagrid/models/operations/operationColumns";
import { OperationRow } from "./types";

const OperationDataGrid = ({
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

  // Create a key based on the initialData that will change when the data changes.
  const gridKey = useMemo(() => JSON.stringify(initialData), [initialData]);

  return (
    <DataGrid
      key={gridKey} // This forces a remount when initialData changes.
      columns={columns}
      columnGroupModel={columnGroup}
      fetchPageData={fetchOperationsPageData}
      paginationMode="server"
      initialData={initialData}
    />
  );
};

export default OperationDataGrid;
