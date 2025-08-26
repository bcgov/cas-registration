"use client";

import { useMemo, useState } from "react";
import DataGrid from "@bciers/components/datagrid/DataGrid";
import HeaderSearchCell from "@bciers/components/datagrid/cells/HeaderSearchCell";
import { AnnualReportRow } from "./types";
import annualReportsColumns from "../datagrid/models/annualReports/annualReportsColumns";
import annualReportsGroupColumns from "../datagrid/models/annualReports/annualReportsGroupColumns";
import { fetchAnnualReportsPageData } from "./fetchAnnualReportsPageData";

const AnnualReportsDataGrid = ({
  initialData,
}: {
  initialData: {
    rows: AnnualReportRow[];
    row_count: number;
  };
}) => {
  const [lastFocusedField, setLastFocusedField] = useState<string | null>(null);

  const SearchCell = useMemo(
    () => HeaderSearchCell({ lastFocusedField, setLastFocusedField }),
    [lastFocusedField, setLastFocusedField],
  );

  const columns = annualReportsColumns();

  const columnGroup = useMemo(
    () => annualReportsGroupColumns(SearchCell),
    [SearchCell],
  );

  // Create a key based on the initialData that will change when the data changes.
  const gridKey = useMemo(() => JSON.stringify(initialData), [initialData]);

  return (
    <DataGrid
      key={gridKey} // This forces a remount when initialData changes.
      columns={columns}
      columnGroupModel={columnGroup}
      fetchPageData={fetchAnnualReportsPageData}
      paginationMode="server"
      initialData={initialData}
    />
  );
};

export default AnnualReportsDataGrid;
