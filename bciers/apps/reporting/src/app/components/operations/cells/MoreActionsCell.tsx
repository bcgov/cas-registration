import * as React from "react";
import { useTransition } from "react";
import Button from "@mui/material/Button";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import { useRouter } from "next/navigation";
import { GridRenderCellParams } from "@mui/x-data-grid";
import { ReportOperationStatus } from "@bciers/utils/src/enums";
import postSupplementaryReportVersion from "@reporting/src/app/utils/postSupplementaryReportVersion";

type ConfirmAction = "discard" | "supplementary" | null;

const MoreActionsCell = (params: GridRenderCellParams) => {
  const reportVersionId = params?.row?.report_version_id;
  const reportId = params?.row?.report_id;
  const reportStatus = params?.row?.report_status;

  const [pending, startTransition] = useTransition();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [confirmAction, setConfirmAction] = React.useState<ConfirmAction>(null);
  const open = Boolean(anchorEl);
  const router = useRouter();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Open the confirmation dialog for the given action.
  const openConfirmation = (action: "discard" | "supplementary") => {
    setConfirmAction(action);
  };

  // Cancel the confirmation prompt.
  const cancelConfirmation = () => {
    setConfirmAction(null);
    handleClose();
  };

  // Handle the confirmed discard action.
  const confirmDiscard = async () => {
    setConfirmAction(null);
    await startTransition(async () => {
      console.log(
        "Discard draft confirmed for report version:",
        reportVersionId,
      );
      const delay = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));
      await delay(2000);
      handleClose();
    });
  };

  // Handle the confirmed supplementary report action.
  const confirmSupplementaryReport = async () => {
    setConfirmAction(null);
    await startTransition(async () => {
      const response = await postSupplementaryReportVersion(reportVersionId);
      if (response && !response.error) {
        router.push(`/reports/${response}/review-operation-information`);
      }
      // Keep the menu open during the async operation so the spinner is visible.
      handleClose();
    });
  };

  // Determine the confirmation dialog content based on the action.
  const getConfirmationContent = () => {
    if (confirmAction === "discard") {
      return {
        title: "Discard Draft?",
        message: "Are you sure you want to discard this draft?",
        onConfirm: confirmDiscard,
      };
    } else if (confirmAction === "supplementary") {
      return {
        title: "Create Supplementary Report?",
        message: "Are you sure you want to create a supplementary report?",
        onConfirm: confirmSupplementaryReport,
      };
    }
    return { title: "", message: "", onConfirm: () => {} };
  };

  const { title, message, onConfirm } = getConfirmationContent();

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
              //❗By defaut errors in event handlers don't bubble to Error Boundaries
              // Wrapping event handlers in startTransition allows errors to propagate to the Error Boundary.
              startTransition(async () => {
                openConfirmation("supplementary");
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
        {reportStatus && reportStatus === ReportOperationStatus.DRAFT && (
          <MenuItem
            disabled={pending}
            onClick={() => {
              startTransition(async () => {
                openConfirmation("discard");
              });
            }}
          >
            {pending ? <CircularProgress size={20} /> : "Discard Draft"}
          </MenuItem>
        )}
        {!pending && reportId && (
          <MenuItem
            onClick={async () =>
              router.push(`reports/report-history/${reportId}`)
            }
          >
            Report History
          </MenuItem>
        )}
        {!pending && !reportId && (
          <MenuItem disabled={true}>Report History</MenuItem>
        )}
      </Menu>
      {/* Custom Confirmation Dialog */}
      <Dialog open={Boolean(confirmAction)} onClose={cancelConfirmation}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>{message}</DialogContent>
        <DialogActions>
          <Button
            onClick={cancelConfirmation}
            color="primary"
            variant="outlined"
            aria-label="Cancel"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            color="primary"
            variant="contained"
            aria-label="Confirm"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default MoreActionsCell;
