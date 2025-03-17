"use client";

import { useMemo, useState } from "react";
import DataGrid from "@bciers/components/datagrid/DataGrid";
import HeaderSearchCell from "@bciers/components/datagrid/cells/HeaderSearchCell";
import operationGroupColumns from "@reporting/src/app/components/datagrid/models/operations/operationGroupColumns";
import operationColumns from "@reporting/src/app/components/datagrid/models/operations/operationColumns";
import { OperationRow } from "./types";
import { fetchReportHistoryPageData } from "@reporting/src/app/components/reportHistory/fetchReportHistoryPageData";

const ReportHistoryDataGrid = ({
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
      fetchPageData={fetchReportHistoryPageData}
      paginationMode="server"
      initialData={initialData}
    />
  );
};

export default ReportHistoryDataGrid;
