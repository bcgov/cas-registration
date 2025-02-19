"use client";

import DataGrid from "@bciers/components/datagrid/DataGrid";
import { ComplianceSummariesSearchParams, ComplianceSummary } from "./types";
import Button from "@mui/material/Button";
import Link from "next/link";

export default function ComplianceSummaries({
  searchParams,
}: {
  searchParams: ComplianceSummariesSearchParams;
}) {
  // TODO: Replace with actual API call
  const data: ComplianceSummary[] = [
    {
      id: "1",
      reportingYear: 2023,
      operationName: "Operation A",
      excessEmissions: 1500,
    },
    // Add more mock data as needed
  ];

  const columns = [
    {
      field: "reportingYear",
      headerName: "Reporting Year",
      width: 150,
    },
    {
      field: "operationName",
      headerName: "Operation Name",
      width: 200,
    },
    {
      field: "excessEmissions",
      headerName: "Excess Emission (tCO2e)",
      width: 200,
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      renderCell: (params: { row: ComplianceSummary }) => (
        <Link href={`/compliance-summaries/${params.row.id}`}>
          <Button variant="outlined" size="small">
            View Details
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="mt-4">
      <DataGrid
        columns={columns}
        initialData={{ rows: data }}
        pageSize={parseInt(searchParams.pageSize || "10")}
        paginationMode="client"
      />
    </div>
  );
} 