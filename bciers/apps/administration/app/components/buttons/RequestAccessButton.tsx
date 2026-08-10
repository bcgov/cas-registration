"use client";

import { useState } from "react";
import Button from "@mui/material/Button";
import { actionHandler } from "@bciers/actions";
import { useRouter } from "next/navigation";
import { ghgRegulatorEmail } from "@bciers/utils/src/urls";
import { useFormErrors } from "@reporting/src/hooks/useFormErrors";
import { ReportValidationItem } from "@reporting/src/app/components/shared/validation/types";

interface RequestAccessButtonProps {
  operatorId: number;
  operatorName: string;
  isAdminRequest?: boolean;
}

const createErrorItem = (
  message: string,
  operatorId?: number,
): ReportValidationItem => {
  const isBceidError = message.includes(
    "Your business BCeID does not have access to this operator.",
  );

  return {
    key: "generic_error",
    error: {
      message,
      severity: "Error",
      context: isBceidError
        ? {
            email: ghgRegulatorEmail,
            report_version_id: operatorId,
          }
        : undefined,
    },
  };
};

export default function RequestAccessButton({
  operatorId,
  operatorName,
  isAdminRequest = false,
}: Readonly<RequestAccessButtonProps>) {
  const router = useRouter();
  const { setErrors, renderedErrors } = useFormErrors();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const label = isAdminRequest
    ? "Request administrator access"
    : "Request access";

  const endpointUrl = `registration/operators/${operatorId}/${
    isAdminRequest ? "request-admin-access" : "request-access"
  }`;

  const handleRequestAccess = async () => {
    setIsSubmitting(true);

    try {
      const response = await actionHandler(endpointUrl, "POST", "");

      if (response?.error) {
        setErrors([createErrorItem(response.error, operatorId)]);
      } else {
        router.push(
          `/select-operator/received/request-access/${operatorId}?title=${operatorName}`,
        );
      }
    } catch (err: any) {
      setErrors([
        createErrorItem(
          err?.message || "An unexpected error occurred. Please try again.",
          operatorId,
        ),
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="min-h-6 flex justify-center w-full">{renderedErrors}</div>
      <Button
        className="my-10"
        sx={{ textTransform: "none" }} // to remove uppercase text
        aria-label={label ?? "Request Access"}
        color="primary"
        variant="contained"
        onClick={handleRequestAccess}
        disabled={isSubmitting}
      >
        {label}
      </Button>
    </>
  );
}
