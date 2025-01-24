"use client";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import Button from "@mui/material/Button";
import * as React from "react";
import { useRouter } from "next/navigation";
import { getReportingYear } from "@reporting/src/app/utils/getReportingYear";
import ReportingOperationStatusCell from "@reporting/src/app/components/operations/cells/ReportingOperationStatusCell";
import { createReport } from "@reporting/src/app/utils/createReport";

const ActionCell = (params: GridRenderCellParams) => {
  console.log("params in action cell", params);
  const report_status = params.value;
  const report_version_id = 2;
  const id = params.row.id;
  const router = useRouter();
  const OperationId = params.row.id;
  const [responseError, setResponseError] = React.useState<string | null>(null);
  const [hasClicked, setHasClicked] = React.useState<boolean>(false);

  const handleStartReport = async (
    operationId: string,
    reportingYear: number,
  ): Promise<string> => {
    try {
      const response = await createReport(operationId, reportingYear);
      if (response?.error)
        setResponseError(
          `We couldn't create a report for operation ID '${operationId}' and reporting year '${reportingYear}': ${response?.error}.`,
        );
      return response;
    } catch (error) {
      throw error;
    }
  };

  if (responseError) {
    throw new Error(responseError); // Use the error message in the error boundary in case operation not found
  }

  const handleStartClick = async () => {
    const reportingYearObj = await getReportingYear();
    const newReportId = await handleStartReport(
      OperationId,
      reportingYearObj.reporting_year,
    );
    if (typeof newReportId === "number")
      router.push(`reports/${newReportId}/review-operator-data`);
  };

  if (report_status) {
    return (
      <Button
        color="primary"
        onClick={() =>
          router.push(`reports/${report_version_id}/facilities/${id}/review`)
        }
      >
        View Details
      </Button>
    );
  }

  return (
    <Button
      color="primary"
      disabled={hasClicked}
      onClick={() =>
        router.push(`reports/${report_version_id}/facilities/${id}/review`)
      }
    >
      Continue
    </Button>
  );
};

const facilityColumns = (): GridColDef[] => {
  return [
    {
      field: "name",
      headerName: "Facility Name",
      width: 560,
      sortable: false,
      flex: 1,
    },
    {
      field: "bcghg_id",
      headerName: "Facility BCGHG ID",
      width: 200,
      sortable: false,
    },
    {
      field: "report_status",
      headerName: "Status",
      renderCell: ReportingOperationStatusCell,
      align: "center",
      headerAlign: "center",
      sortable: false,
      width: 200,
    },
    {
      field: "actions",
      headerName: "Actions",
      renderCell: ActionCell,
      sortable: false,
      width: 300,
    },
  ];
};

export default facilityColumns;
