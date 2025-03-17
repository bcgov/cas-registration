"use client";

import { useCallback, useMemo, useState } from "react";
import DataGrid from "@bciers/components/datagrid/DataGrid";
import HeaderSearchCell from "@bciers/components/datagrid/cells/HeaderSearchCell";
import { OperationRow } from "./types";
import { fetchReportHistoryPageData } from "@reporting/src/app/components/reportHistory/fetchReportHistoryPageData";
import { useSearchParams } from "next/navigation";
import reportHistoryColumns from "@reporting/src/app/components/datagrid/models/reportHistory/reportHistoryColumns";
import reportHistoryGroupColumns from "@reporting/src/app/components/datagrid/models/reportHistory/reportHistoryGroupColumns";

const ReportHistoryDataGrid = ({
  report_id,
  initialData,
}: {
  report_id: number;
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
  const browserSearchParams = useSearchParams();
  const columns = reportHistoryColumns();

  const columnGroup = useMemo(
    () => reportHistoryGroupColumns(false, SearchCell),
    [SearchCell],
  );

  const fetchPageData = useCallback(async () => {
    const searchParams = Object.fromEntries(browserSearchParams.entries());

    return await fetchReportHistoryPageData({
      report_id,
      searchParams,
    });
  }, [report_id, browserSearchParams, initialData]);

  const searchParams = Object.fromEntries(browserSearchParams.entries());
  return (
    <DataGrid
      columns={columns}
      columnGroupModel={columnGroup}
      fetchPageData={fetchPageData}
      paginationMode="server"
      initialData={initialData}
    />
  );
};

export default ReportHistoryDataGrid;
