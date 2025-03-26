"use client";

import React, { useCallback } from "react";
import DataGrid from "@bciers/components/datagrid/DataGrid";
import { ReportHistoryRow } from "./types";
import { fetchReportHistoryPageData } from "@reporting/src/app/components/reportHistory/fetchReportHistoryPageData";
import { useSearchParams } from "next/navigation";
import reportHistoryColumns from "@reporting/src/app/components/datagrid/models/reportHistory/reportHistoryColumns";
import { Button, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

const ReportHistoryDataGrid = ({
  report_id,
  initialData,
  operationName,
  reportingYear,
}: {
  report_id: number;
  initialData: {
    rows: ReportHistoryRow[];
    row_count: number;
  };
  operationName: string;
  reportingYear: number;
}) => {
  const browserSearchParams = useSearchParams();
  const router = useRouter();
  const columns = reportHistoryColumns();
  const backUrl = "/reports";

  const fetchPageData = useCallback(() => {
    const searchParams = Object.fromEntries(browserSearchParams.entries());
    return fetchReportHistoryPageData({ report_id, searchParams });
  }, [report_id, browserSearchParams]);

  return (
    <div>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Report History: {operationName}</h2>
      </div>

      <Typography variant="body2" fontSize={16} className="mb-5">
        History of this operation&apos;s report versions for the year{" "}
        <strong>{reportingYear}</strong>
      </Typography>

      <div className="mt-5">
        <DataGrid
          columns={columns}
          fetchPageData={fetchPageData}
          paginationMode="client"
          initialData={initialData}
          noDataMessage={
            <div style={{ textAlign: "center" }}>
              No report versions available. <br />
              Once a report is created, it will be displayed here.
            </div>
          }
        />

        <Button
          className="mt-5"
          variant="outlined"
          onClick={() => router.push(backUrl)}
        >
          Back
        </Button>
      </div>
    </div>
  );
};

export default ReportHistoryDataGrid;
