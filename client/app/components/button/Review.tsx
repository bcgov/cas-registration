"use client";

import { useState } from "react";
import { Alert, Button, Box } from "@mui/material";
import RecommendIcon from "@mui/icons-material/Recommend";
import DoNotDisturbIcon from "@mui/icons-material/DoNotDisturb";
import Modal from "@/app/components/modal/Modal";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

interface Props {
  confirmApproveMessage: string;
  confirmRejectMessage: string;
  approvedMessage: string;
  rejectedMessage: string;
  isStatusPending: boolean;
  onApprove: () => Promise<any>;
  onReject: () => Promise<any>;
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
  rejectedMessage,
  onApprove,
  onReject,
}: Readonly<Props>) => {
  console.log("am i in review");
  const [errorList, setErrorList] = useState([] as any[]);
  const [successMessageList, setSuccessMessageList] = useState([] as any[]);
  const [modalState, setModalState] = useState("" as string);
  const [dismissAlert, setDismissAlert] = useState(false);

  const handleApprove = () => {
    setModalState("approve");
  };

  const handleReject = () => {
    setModalState("reject");
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
    return setSuccessMessageList([{ message: rejectedMessage }]);
  };

  const handleCloseAlert = () => {
    setDismissAlert(true);
  };

  console.log("isStatusPending", isStatusPending);
  const isReviewButtons =
    isStatusPending &&
    errorList.length === 0 &&
    successMessageList.length === 0;

  console.log("isReviewButtons", isReviewButtons);
  const isApprove = modalState === "approve";
  const confirmMessage = isApprove
    ? confirmApproveMessage
    : confirmRejectMessage;

  return (
    <Box
      sx={{
        // 🛠️ to prevent leaving extra space when there is no content
        minHeight: "auto",
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
            flexDirection: "column",
            alignItems: "flex-end",
          }}
        >
          <Box>
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
              Reject <DoNotDisturbIcon />
            </Button>
          </Box>
        </Box>
      )}
      {errorList.length > 0 &&
        !dismissAlert &&
        errorList.map((e: any) => (
          <Alert
            key={e.message}
            action={<CloseButton onClose={handleCloseAlert} />}
            severity="error"
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
          >
            {e.message}
          </Alert>
        ))}
    </Box>
  );
};

export default Review;
