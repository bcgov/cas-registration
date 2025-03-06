import * as React from "react";
import { useTransition } from "react";
import Button from "@mui/material/Button";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import { useRouter } from "next/navigation";
import { GridRenderCellParams } from "@mui/x-data-grid";
import { ReportOperationStatus } from "@bciers/utils/src/enums";
import postSupplementaryReportVersion from "@reporting/src/app/utils/postSupplementaryReportVersion";

const MoreActionsCell = (params: GridRenderCellParams) => {
  const [pending, startTransition] = useTransition();
  const reportVersionId = params?.row?.report_version_id;
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

  const handleSupplementaryReportVersion = async (reportVersionId: number) => {
    const response = await postSupplementaryReportVersion(reportVersionId);
    if (response && !response.error) {
      router.push(`/reports/${response}/review-operation-information`);
    }
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
              // use transition to display an error to users with the error boundary
              startTransition(async () => {
                await handleSupplementaryReportVersion(reportVersionId);
                handleClose(); // Close the menu AFTER the report is created
              });
            }}
          >
            {pending ? (
              <CircularProgress size={20} />
            ) : (
              "Create Supplementary Report"
            )}
          </MenuItem>
        )}
        {!pending && (
          <MenuItem
            onClick={async () =>
              router.push(`reports/${reportId}/report-history`)
            }
          >
            Report History
          </MenuItem>
        )}
      </Menu>
    </div>
  );
};

export default MoreActionsCell;
