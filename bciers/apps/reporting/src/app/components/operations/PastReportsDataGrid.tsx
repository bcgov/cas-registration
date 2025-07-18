"use client";

import { useMemo, useState } from "react";
import DataGrid from "@bciers/components/datagrid/DataGrid";
import HeaderSearchCell from "@bciers/components/datagrid/cells/HeaderSearchCell";
import { PastReportsRow } from "./types";
import pastReportsColumns from "../datagrid/models/pastReports/pastReportsColumns";
import pastReportsGroupColumns from "../datagrid/models/pastReports/pastReportsGroupColumns";
import { fetchPastReportsPageData } from "./fetchPastReportsPageData";

const PastReportsDataGrid = ({
  initialData,
}: {
  initialData: {
    rows: PastReportsRow[];
    row_count: number;
  };
}) => {
  const [lastFocusedField, setLastFocusedField] = useState<string | null>(null);

  const SearchCell = useMemo(
    () => HeaderSearchCell({ lastFocusedField, setLastFocusedField }),
    [lastFocusedField, setLastFocusedField],
  );

  const columns = pastReportsColumns();

  const columnGroup = useMemo(
    () => pastReportsGroupColumns(SearchCell),
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

export default PastReportsDataGrid;
