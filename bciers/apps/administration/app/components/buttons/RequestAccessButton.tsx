"use client";

import { useState } from "react";
import Button from "@mui/material/Button";
import { actionHandler } from "@bciers/actions";
import { useRouter } from "next/navigation";
import {
  useValidationErrors,
  handleApiResponse,
} from "@bciers/components/validationErrors";
import { validationUIConfig } from "@/administration/app/components/validationErrors/config";
import type { ValidationKey } from "@/administration/app/components/validationErrors/types";

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
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { setErrors, renderedErrors } = useValidationErrors<ValidationKey>({
    config: validationUIConfig,
  });

  const label = isAdminRequest
    ? "Request administrator access"
    : "Request access";

  const endpointUrl = `registration/operators/${operatorId}/${
    isAdminRequest ? "request-admin-access" : "request-access"
  }`;

  const handleRequestAccess = async () => {
    setIsSubmitting(true);
    setErrors(undefined);

    const response = await actionHandler(endpointUrl, "POST", "");
    setIsSubmitting(false);

    const isSuccess = handleApiResponse(response, setErrors);
    if (!isSuccess) return;

    router.push(
      `/select-operator/received/request-access/${operatorId}?title=${encodeURIComponent(
        operatorName,
      )}`,
    );
  };

  return (
    <>
      <div className="min-h-6 flex justify-center w-full">{renderedErrors}</div>
      <Button
        className="my-10"
        sx={{ textTransform: "none" }}
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
