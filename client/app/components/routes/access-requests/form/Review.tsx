"use client";

import { Alert, Button, ButtonGroup, Box } from "@mui/material";
import RecommendIcon from "@mui/icons-material/Recommend";
import DoNotDisturbIcon from "@mui/icons-material/DoNotDisturb";
import { createSubmitHandler } from "@/app/utils/actions";
import { UserOperatorFormProps } from "@/app/components/form/UserOperatorForm";
import React, { useState } from "react";
import { Status } from "@/app/types";

interface Props {
  userOperator: UserOperatorFormProps;
}

export default function Review(props: Readonly<Props>) {
  const [errorList, setErrorList] = useState([] as any[]);
  const [successMessageList, setSuccessMessageList] = useState([] as any[]);

  async function approveRequest() {
    props.userOperator.formData.status = Status.APPROVED;
    const response = await createSubmitHandler(
      "PUT",
      `registration/userOperators/${props.userOperator.userOperatorId}/update-status`,
      `dashboard/userOperators/${props.userOperator.userOperatorId}`,
      props.userOperator,
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
    props.userOperator.status = Status.REJECTED;
    const response = await createSubmitHandler(
      "PUT",
      `registration/userOperators/${props.userOperator.userOperatorId}/update-status`,
      `dashboard/userOperators/${props.userOperator.userOperatorId}`,
      props.userOperator,
    );
    if (response.error) {
      setErrorList([{ message: response.error }]);
    } else if (response.ok) {
      setSuccessMessageList([
        { message: "You have rejected the request for carbon tax exemption." },
      ]);
    }
  }

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "right",
        }}
      >
        <ButtonGroup variant="contained">
          <Button
            onClick={approveRequest}
            color="success"
            aria-label="Approve application"
          >
            Approve <RecommendIcon />
          </Button>
          <Button
            onClick={rejectRequest}
            color="error"
            aria-label="Reject application"
          >
            Reject <DoNotDisturbIcon />
          </Button>
        </ButtonGroup>
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
