"use client";

import { useState } from "react";
import { Alert, Button, Box } from "@mui/material";
import RecommendIcon from "@mui/icons-material/Recommend";
import Note from "@bciers/components/datagrid/Note";
import DoNotDisturbIcon from "@mui/icons-material/DoNotDisturb";
import Modal from "@bciers/components/modal/Modal";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { Role, Status } from "@bciers/utils/src/enums";
import {
  useValidationErrors,
  handleApiResponse,
} from "@bciers/components/validationErrors";

interface Props {
  confirmApproveMessage: string;
  confirmRejectMessage: string;
  approvedMessage: string;
  declinedMessage: string;
  role: Role;
  status: Status;
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
  declinedMessage,
  note,
  role,
  status,
  onApprove,
  onReject,
}: Readonly<Props>) => {
  const [successMessageList, setSuccessMessageList] = useState([] as any[]);
  const [modalState, setModalState] = useState("" as string);
  const [dismissAlert, setDismissAlert] = useState(false);

  const { setErrors, renderedErrors } = useValidationErrors();

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
    setErrors(undefined);
    setModalState("");
    const response = await onApprove();
    const isSuccess = handleApiResponse(response, setErrors);

    if (!isSuccess) {
      return;
    }

    return setSuccessMessageList([{ message: approvedMessage }]);
  };

  const handleConfirmReject = async () => {
    setErrors(undefined);
    setModalState("");
    const response = await onReject();
    const isSuccess = handleApiResponse(response, setErrors);

    if (!isSuccess) {
      return;
    }

    setSuccessMessageList([{ message: declinedMessage }]);
  };

  const handleCloseAlert = () => {
    setDismissAlert(true);
  };

  const isReviewButtons =
    status !== Status.DECLINED &&
    role !== Role.ADMIN &&
    !renderedErrors &&
    successMessageList.length === 0;

  const isApprove = modalState === "approve";
  const confirmMessage = isApprove
    ? confirmApproveMessage
    : confirmRejectMessage;

  return (
    <Box
      // 🛠️ min-h-auto to prevent leaving extra space when there is no content
      className={`min-h-auto w-full ${isReviewButtons ? "mb-4" : "mb-0"}`}
    >
      <Modal
        title="Please confirm"
        open={Boolean(modalState)}
        onClose={handleCloseModal}
      >
        <Box className="text-[20px] min-w-full my-2 mx-0">{confirmMessage}</Box>
        <Box className="w-full flex flex-row justify-center items-center mt-6">
          <Button
            onClick={
              modalState === "approve"
                ? handleConfirmApprove
                : handleConfirmReject
            }
            color="primary"
            variant="contained"
            aria-label="Confirm"
            className="mr-3 capitalize"
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
            justifyContent: note ? "space-between" : "flex-end",
          }}
        >
          {note && (
            <span className="w-full mb-2 lg:mb-0">
              <Note message={note} />
            </span>
          )}
          {
            <Box className="w-fit min-w-fit h-fit">
              <Button
                onClick={handleApprove}
                className="mr-2 border border-solid border-current font-bold"
                color="success"
                variant="outlined"
                aria-label="Approve application"
              >
                Approve as Administrator <RecommendIcon />
              </Button>
              <Button
                onClick={handleReject}
                color="error"
                variant="outlined"
                aria-label="Reject application"
                className="border border-solid border-current font-bold"
              >
                Decline Access <DoNotDisturbIcon />
              </Button>
            </Box>
          }
        </Box>
      )}

      {renderedErrors && <div className="mb-4">{renderedErrors}</div>}

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
