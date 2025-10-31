"use client";

import { useMemo, useState } from "react";
import type { GridRowParams } from "@mui/x-data-grid";
import DataGrid from "@bciers/components/datagrid/DataGrid";
import { ComplianceSummary } from "@/compliance/src/app/types";
import complianceSummaryColumns from "@/compliance/src/app/components/datagrid/models/compliance-summaries/complianceSummaryColumns";
import { fetchComplianceSummariesPageData } from "@/compliance/src/app/utils/fetchComplianceSummariesPageData";
import complianceSummaryGroupColumns from "@/compliance/src/app/components/datagrid/models/compliance-summaries/complianceSummaryGroupColumns";
import HeaderSearchCell from "@bciers/components/datagrid/cells/HeaderSearchCell";

const ComplianceSummariesDataGrid = ({
  initialData,
  isAllowedCas,
}: {
  initialData: { rows: ComplianceSummary[]; row_count: number };
  isAllowedCas: boolean;
}) => {
  const columns = complianceSummaryColumns(isAllowedCas);

  const [lastFocusedField, setLastFocusedField] = useState<string | null>(null);
  const SearchCell = useMemo(
    () => HeaderSearchCell({ lastFocusedField, setLastFocusedField }),
    [lastFocusedField, setLastFocusedField],
  );
  const columnGroup = useMemo(
    () => complianceSummaryGroupColumns(SearchCell, isAllowedCas),
    [SearchCell, isAllowedCas],
  );

  // Highlight rows that require manual handling
  const getRowClassName = (params: GridRowParams) =>
    params.row?.requires_manual_handling ? "row--highlight" : "";

  return (
    <DataGrid
      columns={columns}
      fetchPageData={fetchComplianceSummariesPageData}
      initialData={initialData}
      columnGroupModel={columnGroup}
      paginationMode="server"
      getRowClassName={getRowClassName}
    />
  );
};

export default ComplianceSummariesDataGrid;
