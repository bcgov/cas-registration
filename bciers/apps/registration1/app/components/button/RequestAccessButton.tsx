"use client";

import Button from "@mui/material/Button";
import { actionHandler } from "@bciers/actions";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@mui/material";

interface RequestAccessButtonProps {
  operatorId: number;
  isAdminRequest?: boolean;
}

export default function RequestAccessButton({
  operatorId,
  isAdminRequest = false,
}: Readonly<RequestAccessButtonProps>) {
  const { push } = useRouter();
  const [errorList, setErrorList] = useState([] as any[]);

  const label = isAdminRequest
    ? "Request Administrator Access"
    : "Request Access";

  const endpointUrl = `registration/v1/operators/${operatorId}/${
    isAdminRequest ? "request-admin-access" : "request-access"
  }`;

  const handleRequestAccess = async () => {
    const response = await actionHandler(
      endpointUrl,
      "POST",
      `/dashboard/select-operator/confirm/${operatorId}`,
    );
    if (response.error) {
      setErrorList([{ message: response.error }]);
      return;
    }
    // admin vs. subsequent access request conditionality handled in component
    push(`/dashboard/select-operator/received/request-access/${operatorId}`);
  };

  return (
    <>
      {errorList.length > 0 &&
        errorList.map((e: any) => (
          <Alert key={e.message} severity="error">
            {e.message}
          </Alert>
        ))}
      <Button
        className="my-10"
        sx={{ textTransform: "none" }} //to remove uppercase text
        aria-label={label ?? "Request Access"}
        color="primary"
        variant="contained"
        onClick={async () => {
          handleRequestAccess();
        }}
      >
        {label}
      </Button>
    </>
  );
}
