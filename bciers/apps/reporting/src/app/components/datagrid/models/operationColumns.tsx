import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import * as React from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { actionHandler } from "@bciers/actions";

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
) => {
  try {
    const reportId = await actionHandler("reporting/reports", "POST", "", {
      body: JSON.stringify({
        operation_id: operationId,
        reporting_year: reportingYear,
      }),
    });

    return reportId;
  } catch (error) {
    throw error;
  }
};

const ActionCell = (params: GridRenderCellParams) => {
  const reportId = params.value;
  const reportingYear = 2024;

  if (reportId) {
    return <a href={`/reporting/report/${reportId}`}>Continue</a>;
  }

  const OperationId = params.row.id;
  return (
    <Button onClick={() => handleStartReport(OperationId, reportingYear)}>
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
