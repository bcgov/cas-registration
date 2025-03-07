"use client";

import { useMemo, useState } from "react";
import DataGrid from "@bciers/components/datagrid/DataGrid";
import HeaderSearchCell from "@bciers/components/datagrid/cells/HeaderSearchCell";
import { ComplianceSummary } from "./types";
import complianceSummaryColumns from "../datagrid/models/compliance-summaries/complianceSummaryColumns";
import complianceSummaryGroupColumns from "../datagrid/models/compliance-summaries/complianceSummaryGroupColumns";
import { fetchComplianceSummariesPageData } from "./fetchComplianceSummariesPageData";

const ComplianceSummariesDataGrid = ({
  initialData,
}: {
  initialData: {
    rows: ComplianceSummary[];
    row_count: number;
  };
}) => {
  const [lastFocusedField, setLastFocusedField] = useState<string | null>(null);

  const SearchCell = useMemo(
    () => HeaderSearchCell({ lastFocusedField, setLastFocusedField }),
    [lastFocusedField, setLastFocusedField],
  );

  const columns = complianceSummaryColumns();

  const columnGroup = useMemo(
    () => complianceSummaryGroupColumns(SearchCell),
    [SearchCell],
  );

  return (
    <DataGrid
      columns={columns}
      columnGroupModel={columnGroup}
      fetchPageData={fetchComplianceSummariesPageData}
      paginationMode="server"
      initialData={initialData}
    />
  );
};

export default ComplianceSummariesDataGrid;
