"use client";

import Button from "@mui/material/Button";
import { actionHandler } from "@/app/utils/actions";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@mui/material";

interface RequestAccessButtonProps {
  operatorId: number;
}

export default function RequestAccessButton({
  operatorId,
}: RequestAccessButtonProps) {
  // 🧩common button config
  const commonButtonConfig = {
    width: "160px",
    height: "60px",
    fontWeight: 700,
    fontSize: "12px",
    lineHeight: "14.52px",
    textAlign: "center",
    padding: 0,
  };

  const { push } = useRouter();
  const [errorList, setErrorList] = useState([] as any[]);

  const handleRequestAccess = async () => {
    const response = await actionHandler(
      "registration/select-operator/request-access",
      "POST",
      `/dashboard/select-operator/confirm/${operatorId}`,
      {
        body: JSON.stringify({
          operator_id: operatorId,
        }),
      },
    );
    if (response.error) {
      setErrorList([{ message: response.error }]);
      return;
    }

    push(`/dashboard/select-operator/received/${operatorId}`);
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
        style={{ margin: "0 auto", display: "flex" }}
        sx={{ ...commonButtonConfig }}
        aria-label="Request Access"
        color="primary"
        variant="contained"
        onClick={async () => handleRequestAccess()}
      >
        Request Access
      </Button>
    </>
  );
}
