"use client";

import { useState } from "react";
import { Alert, Button, Box } from "@mui/material";
import RecommendIcon from "@mui/icons-material/Recommend";
import Note from "@bciers/components/datagrid/Note";
import DoNotDisturbIcon from "@mui/icons-material/DoNotDisturb";
import Modal from "@bciers/components/modal/Modal";
import RequestChanges from "./RequestChanges";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { Status } from "@bciers/utils/src/enums";

interface Props {
  confirmApproveMessage: string;
  confirmRejectMessage: string;
  approvedMessage: string;
  declinedMessage: string;
  isStatusPending: boolean;
  operationStatus?: Status;
  note?: string;
  showRequestChanges?: boolean;
  onApprove: () => Promise<any>;
  onReject: () => Promise<any>;
  onRequestChange?: () => Promise<any>;
  onUndoRequestChange?: () => Promise<any>;
}

interface CloseProps {
  onClose: () => void;
}

const CloseButton = ({ onClose }: CloseProps) => {
  return (
    <IconButton
      aria-label="close"
      color="inherit"
      size="small"
      onClick={() => {
        onClose();
      }}
    >
      <CloseIcon fontSize="inherit" />
    </IconButton>
  );
};

const Review = ({
  approvedMessage,
  confirmApproveMessage,
  confirmRejectMessage,
  isStatusPending,
  operationStatus,
  declinedMessage,
  note,
  showRequestChanges = true,
  onApprove,
  onReject,
  onRequestChange,
  onUndoRequestChange,
}: Readonly<Props>) => {
  const [errorList, setErrorList] = useState([] as any[]);
  const [successMessageList, setSuccessMessageList] = useState([] as any[]);
  const [modalState, setModalState] = useState("" as string);
  const [dismissAlert, setDismissAlert] = useState(false);
  const [showChangeConfirmation, setShowChangeConfirmation] = useState(false);
  const [showRequestChangesUndo, setShowRequestChangesUndo] = useState(
    operationStatus ? operationStatus === Status.CHANGES_REQUESTED : false,
  );

  const handleApprove = () => {
    setModalState("approve");
  };

  const handleReject = () => {
    setModalState("decline");
  };

  const handleCloseModal = () => {
    setModalState("");
  };

  const handleConfirmApprove = async () => {
    const response = await onApprove();
    if (response.error) {
      setModalState("");
      return setErrorList([{ message: response.error }]);
    }

    setModalState("");
    return setSuccessMessageList([{ message: approvedMessage }]);
  };

  const handleConfirmReject = async () => {
    const response = await onReject();
    if (response.error) {
      setModalState("");
      return setErrorList([{ message: response.error }]);
    }

    setModalState("");
    return setSuccessMessageList([{ message: declinedMessage }]);
  };

  const handleCloseAlert = () => {
    setDismissAlert(true);
  };

  const handleCancelRequestChange = () => {
    setShowChangeConfirmation(false);
  };

  const handleRequestChange = () => {
    setShowChangeConfirmation(true);
  };

  const handleChangeRequestConfirm = () => {
    onRequestChange?.();
    setShowRequestChangesUndo(true);
  };

  const handleUndoRequestChanges = async () => {
    onUndoRequestChange?.();
    setShowChangeConfirmation(false);
    setShowRequestChangesUndo(false);
  };
  const isReviewButtons =
    (isStatusPending &&
      errorList.length === 0 &&
      successMessageList.length === 0) ||
    showRequestChangesUndo;

  const isApprove = modalState === "approve";
  const confirmMessage = isApprove
    ? confirmApproveMessage
    : confirmRejectMessage;

  return (
    <Box
      sx={{
        // 🛠️ to prevent leaving extra space when there is no content
        minHeight: "auto",
        width: "100%",
        marginBottom: isReviewButtons ? "16px" : "0",
      }}
    >
      <Modal
        title="Please confirm"
        open={Boolean(modalState)}
        onClose={handleCloseModal}
      >
        <Box
          sx={{
            fontSize: "20px",
            minWidth: "100%",
            margin: "8px 0",
          }}
        >
          {confirmMessage}
        </Box>
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            marginTop: "24px",
          }}
        >
          <Button
            onClick={
              modalState === "approve"
                ? handleConfirmApprove
                : handleConfirmReject
            }
            color="primary"
            variant="contained"
            aria-label="Confirm"
            sx={{
              marginRight: "12px",
              textTransform: "capitalize",
            }}
          >
            {modalState || "Approve"}
          </Button>
          <Button
            onClick={handleCloseModal}
            color="primary"
            variant="outlined"
            aria-label="Cancel"
          >
            Cancel
          </Button>
        </Box>
      </Modal>

      {isReviewButtons && (
        <Box
          sx={{
            display: "flex",
            flexDirection: {
              xs: "column",
              lg: "row",
            },
            width: "100%",
            alignItems: {
              xs: "flex-end",
              lg: "center",
            },
            justifyContent:
              showRequestChanges || note ? "space-between" : "flex-end",
          }}
        >
          {showRequestChanges && (
            <RequestChanges
              onCancelRequestChange={handleCancelRequestChange}
              onRequestChange={handleRequestChange}
              onRequestChangeConfirm={handleChangeRequestConfirm}
              onUndoRequestChanges={handleUndoRequestChanges}
              showUndo={showRequestChangesUndo}
            />
          )}
          {note && (
            <span className="w-full mb-2 lg:mb-0">
              <Note message={note} />
            </span>
          )}
          {!showChangeConfirmation && !showRequestChangesUndo && (
            <Box
              sx={{
                width: "fit-content",
                minWidth: "fit-content",
                height: "fit-content",
              }}
            >
              <Button
                onClick={handleApprove}
                className="mr-2"
                color="success"
                variant="outlined"
                aria-label="Approve application"
                sx={{
                  marginRight: "12px",
                  border: "1px solid",
                  fontWeight: "bold",
                }}
              >
                Approve <RecommendIcon />
              </Button>
              <Button
                onClick={handleReject}
                color="error"
                variant="outlined"
                aria-label="Reject application"
                sx={{
                  border: "1px solid",
                  fontWeight: "bold",
                }}
              >
                Decline <DoNotDisturbIcon />
              </Button>
            </Box>
          )}
        </Box>
      )}
      {errorList.length > 0 &&
        !dismissAlert &&
        errorList.map((e: any) => (
          <Alert
            key={e.message}
            action={<CloseButton onClose={handleCloseAlert} />}
            severity="error"
            className="mb-4"
          >
            {e?.stack ?? e.message}
          </Alert>
        ))}
      {successMessageList.length > 0 &&
        !dismissAlert &&
        successMessageList.map((e: any) => (
          <Alert
            key={e.message}
            action={<CloseButton onClose={handleCloseAlert} />}
            severity="success"
            className="mb-4"
          >
            {e.message}
          </Alert>
        ))}
    </Box>
  );
};

export default Review;
