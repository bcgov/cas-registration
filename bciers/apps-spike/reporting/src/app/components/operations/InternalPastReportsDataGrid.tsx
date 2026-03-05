"use client";

import { useMemo, useState } from "react";
import DataGrid from "@bciers/components/datagrid/DataGrid";
import HeaderSearchCell from "@bciers/components/datagrid/cells/HeaderSearchCell";
import { ReportRow } from "./types";
import { fetchPastReportsPageData } from "./fetchPastReportsPageData";
import internalPastReportsColumns from "../datagrid/models/pastReports/internalPastReportsColumns";
import internalPastReportsGroupColumns from "../datagrid/models/pastReports/internalPastReportsGroupColumns";

const InternalPastReportsDataGrid = ({
  initialData,
}: {
  initialData: {
    rows: ReportRow[];
    row_count: number;
  };
}) => {
  const [lastFocusedField, setLastFocusedField] = useState<string | null>(null);

  const SearchCell = useMemo(
    () => HeaderSearchCell({ lastFocusedField, setLastFocusedField }),
    [lastFocusedField, setLastFocusedField],
  );

  const columns = internalPastReportsColumns();

  const columnGroup = useMemo(
    () => internalPastReportsGroupColumns(SearchCell),
    [SearchCell],
  );

  // Create a key based on the initialData that will change when the data changes.
  const gridKey = useMemo(() => JSON.stringify(initialData), [initialData]);

  return (
    <DataGrid
      key={gridKey} // This forces a remount when initialData changes.
      columns={columns}
      columnGroupModel={columnGroup}
      fetchPageData={fetchPastReportsPageData}
      paginationMode="server"
      initialData={initialData}
    />
  );
};

export default InternalPastReportsDataGrid;
