"use client";

import { Alert, Button, ButtonGroup, Box } from "@mui/material";
import RecommendIcon from "@mui/icons-material/Recommend";
import DoNotDisturbIcon from "@mui/icons-material/DoNotDisturb";
import { actionHandler } from "@/app/utils/actions";
import React, { useState } from "react";
import { Status } from "@/app/types/types";
import { UserOperatorFormData } from "@/app/components/form/formDataTypes";

interface Props {
  // TODO: fix schema of userOperator data
  userOperator: UserOperatorFormData;
  userOperatorId: number;
}

export default function Review(props: Props) {
  const [errorList, setErrorList] = useState([] as any[]);
  const [successMessageList, setSuccessMessageList] = useState([] as any[]);

  async function approveRequest() {
    props.userOperator.status = Status.APPROVED;
    const response = await actionHandler(
      `registration/user-operators/${props.userOperatorId}/update-status`,
      "PUT",
      `dashboard/operators/user-operators/${props.userOperatorId}`,
      {
        body: JSON.stringify(props.userOperator),
      },
    );
    if (response.error) {
      return setErrorList([{ message: response.error }]);
    }
    return setSuccessMessageList([
      { message: "You have approved the request for prime admin access." },
    ]);
  }

  async function rejectRequest() {
    props.userOperator.status = Status.REJECTED;
    const response = await actionHandler(
      `registration/user-operators/${props.userOperatorId}/update-status`,
      "PUT",
      `dashboard/operators/user-operators/${props.userOperatorId}`,
      {
        body: JSON.stringify(props.userOperator),
      },
    );
    if (response.error) {
      return setErrorList([{ message: response.error }]);
    }

    return setSuccessMessageList([
      { message: "You have rejected the request for prime admin access." },
    ]);
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
