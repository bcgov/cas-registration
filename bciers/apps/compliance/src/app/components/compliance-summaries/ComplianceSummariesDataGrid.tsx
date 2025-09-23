"use client";

import DataGrid from "@bciers/components/datagrid/DataGrid";
import { ComplianceSummary } from "@/compliance/src/app/types";
import complianceSummaryColumns from "../datagrid/models/compliance-summaries/complianceSummaryColumns";

const ComplianceSummariesDataGrid = ({
  initialData,
  isAllowedCas,
}: {
  initialData: {
    rows: ComplianceSummary[];
    row_count: number;
  };
  isAllowedCas: boolean;
}) => {
  const columns = complianceSummaryColumns(isAllowedCas);

  return (
    <DataGrid
      columns={columns}
      initialData={initialData}
      paginationMode="client"
    />
  );
};

export default ComplianceSummariesDataGrid;
