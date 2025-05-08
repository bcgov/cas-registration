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
import deleteReportVersion from "@reporting/src/app/utils/deleteReportVersion";
import { getIsSupplementaryReport } from "@reporting/src/app/utils/getIsSupplementaryReport";

type ConfirmAction = "delete" | "supplementary" | null;

const MoreActionsCell = (params: GridRenderCellParams) => {
  const reportVersionId = params?.row?.report_version_id;
  const reportId = params?.row?.report_id;
  const reportStatus = params?.row?.report_status;
  const [pending, startTransition] = useTransition();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [confirmAction, setConfirmAction] = React.useState<ConfirmAction>(null);
  const [isSupplementaryReport, setIsSupplementaryReport] =
    React.useState<boolean>(false);
  const open = Boolean(anchorEl);
  const router = useRouter();

  // Determine if Report History should be enabled:
  // If there's a reportId and either we have a reportVersionId,
  // or there is no reportVersionId but isSupplementaryReport is true.
  const showReportHistoryEnabled =
    Boolean(reportId) &&
    ((reportVersionId !== undefined && reportVersionId !== null) ||
      (!reportVersionId && isSupplementaryReport));

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Open the confirmation dialog for the given action.
  const openConfirmation = (action: "delete" | "supplementary") => {
    setConfirmAction(action);
  };

  // Cancel the confirmation prompt.
  const cancelConfirmation = () => {
    setConfirmAction(null);
    handleClose();
  };

  // Handle the confirmed delete action.
  const confirmDiscard = async () => {
    setConfirmAction(null);
    await startTransition(async () => {
      // delete report version
      await deleteReportVersion(reportVersionId);
      // close menu
      handleClose();
      // refetch the grid data
      router.refresh();
    });
  };

  // Handle the confirmed supplementary report action.
  const confirmSupplementaryReport = async () => {
    setConfirmAction(null);
    await startTransition(async () => {
      // create supplementary report
      const response = await postSupplementaryReportVersion(reportVersionId);
      //navigate to new report version
      if (response && !response.error) {
        router.push(`/reports/${response}/review-operation-information`);
      }
      // close menu
      handleClose();
    });
  };

  // Determine the confirmation dialog content based on the action.
  const getConfirmationContent = () => {
    if (confirmAction === "delete") {
      return {
        title: "Confirmation",
        message: isSupplementaryReport
          ? "Please confirm that you would like to delete this draft supplementary report. This operation’s report will revert back to the last submitted version."
          : "Please confirm that you would like to delete this draft report.",
        onConfirm: confirmDiscard,
        confirmButtonLabel: "Delete draft",
      };
    } else if (confirmAction === "supplementary") {
      return {
        title: "Confirmation",
        message:
          "Please confirm that you would like to create a supplementary report. The currently submitted report will remain unchanged.",
        onConfirm: confirmSupplementaryReport,
        confirmButtonLabel: "Create supplementary report",
      };
    }
    return {
      title: "",
      message: "",
      onConfirm: () => {},
      confirmButtonLabel: "Confirm",
    };
  };

  const { title, message, onConfirm, confirmButtonLabel } =
    getConfirmationContent();

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
              // Wrapping event handlers in startTransition allows errors to propagate to the Error Boundary.
              startTransition(async () => {
                openConfirmation("supplementary");
              });
            }}
          >
            {pending ? (
              <CircularProgress size={20} />
            ) : (
              "Create supplementary report"
            )}
          </MenuItem>
        )}
        {reportStatus && reportStatus === ReportOperationStatus.DRAFT && (
          <MenuItem
            disabled={pending}
            onClick={() => {
              // Perform the API call and set the state based on its response before opening the confirmation dialog.
              startTransition(async () => {
                const response =
                  await getIsSupplementaryReport(reportVersionId);
                setIsSupplementaryReport(response);
                openConfirmation("delete");
              });
            }}
          >
            {pending ? <CircularProgress size={20} /> : "Delete draft"}
          </MenuItem>
        )}
        {!pending && reportId && showReportHistoryEnabled && (
          <MenuItem
            onClick={async () =>
              router.push(`reports/report-history/${reportId}`)
            }
          >
            Report history
          </MenuItem>
        )}
        {!pending && reportId && !showReportHistoryEnabled && (
          <MenuItem disabled={true}>Report history</MenuItem>
        )}
        {!pending && !reportId && (
          <MenuItem disabled={true}>Report history</MenuItem>
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
            {confirmButtonLabel}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default MoreActionsCell;
