"use client";

import Button from "@mui/material/Button";
import { actionHandler } from "@bciers/actions";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@mui/material";
import { ghgRegulatorEmail } from "@bciers/utils/src/urls";

interface RequestAccessButtonProps {
  operatorId: number;
  operatorName: string;
  isAdminRequest?: boolean;
}

export default function RequestAccessButton({
  operatorId,
  operatorName,
  isAdminRequest = false,
}: Readonly<RequestAccessButtonProps>) {
  const router = useRouter();
  const [error, setError] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const label = isAdminRequest
    ? "Request administrator access"
    : "Request access";

  const endpointUrl = `registration/operators/${operatorId}/${
    isAdminRequest ? "request-admin-access" : "request-access"
  }`;

  const errorMessageJSX: JSX.Element = (
    <>
      {error}
      {error?.includes(
        "Your business BCeID does not have access to this operator.",
      ) && (
        <a className="ps-1" href={ghgRegulatorEmail}>
          ghgregulator@gov.bc.ca
        </a>
      )}
    </>
  );

  const handleRequestAccess = async () => {
    setIsSubmitting(true);
    const response = await actionHandler(endpointUrl, "POST", "");
    if (response?.error) {
      setError(response.error);
      setIsSubmitting(false);
      return;
    }
    // admin vs. subsequent access request conditionality handled in component: select-operator/(request-access)/received/[step]/[id]
    router.push(
      `/select-operator/received/request-access/${operatorId}?title=${operatorName}`,
    );
  };

  return (
    <>
      <div className="min-h-6 flex justify-center">
        {error && (
          <Alert severity="error" className="w-2/3">
            {errorMessageJSX}
          </Alert>
        )}
      </div>
      <Button
        className="my-10"
        sx={{ textTransform: "none" }} //to remove uppercase text
        aria-label={label ?? "Request Access"}
        color="primary"
        variant="contained"
        onClick={async () => handleRequestAccess()}
        disabled={isSubmitting}
      >
        {label}
      </Button>
    </>
  );
}
