import * as React from "react";
import { useTransition } from "react";
import Button from "@mui/material/Button";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useRouter } from "next/navigation";
import { GridRenderCellParams } from "@mui/x-data-grid";
import { ReportOperationStatus } from "@bciers/utils/src/enums";
import postSupplementaryReport from "@reporting/src/app/utils/postSupplementaryReport";

const MoreActionsCell = (params: GridRenderCellParams) => {
  const [pending, startTransition] = useTransition();

  const reportId = params?.row?.report_id;
  const reportStatus = params?.row?.report_status;

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const router = useRouter();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSupplementaryReport = async (reportVersionId: number) => {
    await postSupplementaryReport(reportVersionId);
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
        {reportStatus && reportStatus === ReportOperationStatus.SUBMITTED && (
          <MenuItem
            disabled={pending}
            onClick={() => {
              handleClose(); // Close the menu first
              // use transition to display an error to users with the error boundary
              startTransition(async () => {
                await handleSupplementaryReport(reportId);
              });
            }}
          >
            Create Supplementary Report
          </MenuItem>
        )}
        <MenuItem
          onClick={async () =>
            router.push(`reports/${reportId}/report-history`)
          }
        >
          Report History
        </MenuItem>
      </Menu>
    </div>
  );
};

export default MoreActionsCell;
