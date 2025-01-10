"use client";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import * as React from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { actionHandler } from "@bciers/actions";
import { useRouter } from "next/navigation";
import { getReportingYear } from "@reporting/src/app/utils/getReportingYear";
import ReportingOperationStatusCell from "@reporting/src/app/components/operations/cells/ReportingOperationStatusCell";

export const OPERATOR_COLUMN_INDEX = 1;

const MoreCell: React.FC = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <Button
        id="basic-button"
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
      >
        <MoreVertIcon />
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        <MenuItem onClick={handleClose}>Edit Report</MenuItem>
        <MenuItem onClick={handleClose}>Report History</MenuItem>
        <MenuItem onClick={handleClose}>Download LFO</MenuItem>
        <MenuItem onClick={handleClose}>Download .csv</MenuItem>
      </Menu>
    </div>
  );
};

const handleStartReport = async (
  operationId: string,
  reportingYear: number,
): Promise<string> => {
  try {
    const reportId = await actionHandler(
      "reporting/create-report",
      "POST",
      "",
      {
        body: JSON.stringify({
          operation_id: operationId,
          reporting_year: reportingYear,
        }),
      },
    );
    return reportId;
  } catch (error) {
    throw error;
  }
};

const ActionCell = (params: GridRenderCellParams) => {
  const reportId = params.value;
  const router = useRouter();
  const OperationId = params.row.id;

  if (reportId) {
    return (
      <Button
        color="primary"
        onClick={() => router.push(`reports/${reportId}/review-operator-data`)}
      >
        Continue
      </Button>
    );
  }

  return (
    <Button
      color="primary"
      onClick={async () => {
        const reportingYearObj = await getReportingYear();
        const newReportId = await handleStartReport(
          OperationId,
          reportingYearObj.reporting_year,
        );
        router.push(`reports/${newReportId}/review-operator-data`);
      }}
    >
      Start
    </Button>
  );
};

const operationColumns = (): GridColDef[] => {
  const columns: GridColDef[] = [
    { field: "bcghg_id", headerName: "BC GHG ID", width: 160 },
    {
      field: "name",
      headerName: "Operation",
      width: 560,
    },
    {
      field: "report_id",
      headerName: "Actions",
      renderCell: ActionCell,
      sortable: false,
      width: 120,
    },
    {
      field: "report_status",
      headerName: "Status",
      renderCell: ReportingOperationStatusCell,
      align: "center",
      headerAlign: "center",
      width: 160,
    },
    {
      field: "more",
      headerName: "More",
      renderCell: () => <MoreCell />,
      sortable: false,
      width: 120,
      flex: 1,
    },
  ];

  return columns;
};

export default operationColumns;
