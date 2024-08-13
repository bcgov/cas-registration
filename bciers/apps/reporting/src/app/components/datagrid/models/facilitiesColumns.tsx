"use client";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import * as React from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { actionHandler } from "@bciers/actions";
import { useRouter } from "next/navigation";

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
  facilityId: string,
  reportingYear: number,
): Promise<string> => {
  try {
    return await actionHandler("reporting/reports", "POST", "", {
      body: JSON.stringify({
        facility_id: facilityId,
        reporting_year: reportingYear,
      }),
    });
  } catch (error) {
    console.error("Error starting report:", error);
    throw new Error("Failed to start report.");
  }
};

const ActionCell = (params: GridRenderCellParams) => {
  const reportId = params.value;
  const facilityId = params.row.id;
  const router = useRouter();

  const handleActionClick = async () => {
    if (reportId) {
      router.push(`${reportId}/facilities/${facilityId}/review`);
    } else {
      try {
        const newReportId = await handleStartReport(
          facilityId,
          await getReportingYear(),
        );
        router.push(`${newReportId}/facilities/${facilityId}/review`);
      } catch (error) {
        console.error("Failed to navigate:", error);
      }
    }
  };

  return (
    <Button color="primary" onClick={handleActionClick}>
      {reportId ? "Continue" : "Start"}
    </Button>
  );
};

const facilityColumns = (): GridColDef[] => {
  const columns: GridColDef[] = [
    { field: "bcghg_id", headerName: "BC GHG ID", width: 160 },
    {
      field: "name",
      headerName: "Facility",
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

export default facilityColumns;
