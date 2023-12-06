"use client";

import { useState } from "react";
import { Alert, Button, Box } from "@mui/material";
import RecommendIcon from "@mui/icons-material/Recommend";
import DoNotDisturbIcon from "@mui/icons-material/DoNotDisturb";
import { actionHandler } from "@/app/utils/actions";
import { OperationsFormData } from "@/app/components/form/OperationsForm";
import Modal from "@/app/components/modal/Modal";
import { Status } from "@/app/types/types";

interface Props {
  operation: OperationsFormData;
}

export default function Review(props: Readonly<Props>) {
  const [errorList, setErrorList] = useState([] as any[]);
  const [successMessageList, setSuccessMessageList] = useState([] as any[]);
  const [modalState, setModalState] = useState("" as string);

  async function approveRequest() {
    props.operation.status = Status.APPROVED;
    const response = await actionHandler(
      `registration/operations/${props.operation.id}/update-status`,
      "PUT",
      `dashboard/operations/${props.operation.id}`,
      {
        body: JSON.stringify(props.operation),
      },
    );
    if (response.error) {
      setErrorList([{ message: response.error }]);
    } else if (response.ok) {
      setSuccessMessageList([
        { message: "You have approved the request for carbon tax exemption." },
      ]);
    }
  }

  async function rejectRequest() {
    props.operation.status = Status.REJECTED;
    const response = await actionHandler(
      `registration/operations/${props.operation.id}/update-status`,
      "PUT",
      `dashboard/operations/${props.operation.id}`,
      {
        body: JSON.stringify(props.operation),
      },
    );
    if (response.error) {
      setErrorList([{ message: response.error }]);
    } else if (response.ok) {
      setSuccessMessageList([
        { message: "You have rejected the request for carbon tax exemption." },
      ]);
    }
  }

  const handleApprove = () => {
    setModalState("approve");
  };

  const handleReject = () => {
    setModalState("reject");
  };

  const handleClose = () => {
    setModalState("");
  };

  return (
    <>
      <Modal
        title="Confirmation"
        open={Boolean(modalState)}
        onClose={handleClose}
      >
        <Box sx={{ fontSize: "20px", margin: "8px 0" }}>
          Are you sure you want to <b>{modalState}</b> this operation?
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
            onClick={modalState === "approve" ? approveRequest : rejectRequest}
            color="success"
            variant="outlined"
            aria-label="Confirm"
            sx={{
              marginRight: "12px",
              border: "1px solid",
              fontWeight: "bold",
            }}
          >
            Confirm
          </Button>
          <Button
            onClick={handleClose}
            color="error"
            variant="outlined"
            aria-label="Cancel"
            sx={{
              border: "1px solid",
              fontWeight: "bold",
            }}
          >
            Cancel
          </Button>
        </Box>
      </Modal>

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
            /*     onClick={approveRequest} */

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
            /*    onClick={rejectRequest} */
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
      {errorList.length > 0 &&
        errorList.map((e: any) => (
          <Alert key={e.message} severity="error">
            {e?.stack ?? e.message}
          </Alert>
        ))}
      {successMessageList.length > 0 &&
        successMessageList.map((e: any) => (
          <Alert key={e.message} severity="success">
            {e.message}
          </Alert>
        ))}
    </>
  );
}
