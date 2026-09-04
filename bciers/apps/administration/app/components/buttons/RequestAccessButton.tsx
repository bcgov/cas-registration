"use client";

import { useTransition } from "react";
import Button from "@mui/material/Button";
import { actionHandler } from "@bciers/actions";
import { useRouter } from "next/navigation";
import {
  useValidationErrors,
  handleApiResponse,
} from "@bciers/components/validationErrors";
import { validationUIConfig } from "@/administration/app/components/validationErrors/config";

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
  const [isPending, startTransition] = useTransition();

  const { setErrors, renderedErrors } = useValidationErrors({
    config: validationUIConfig,
  });

  const label = isAdminRequest
    ? "Request administrator access"
    : "Request access";

  const endpointUrl = `registration/operators/${operatorId}/${
    isAdminRequest ? "request-admin-access" : "request-access"
  }`;

  const handleRequestAccess = () => {
    startTransition(async () => {
      setErrors(undefined);

      const response = await actionHandler(endpointUrl, "POST", "");
      const fallbackKey = response?.error?.includes(
        "Your business BCeID does not have access to this operator",
      )
        ? "no_bceid_access"
        : undefined;

      const isSuccess = handleApiResponse(response, setErrors, fallbackKey);
      if (!isSuccess) return;

      // admin vs. subsequent access request conditionality handled in component: select-operator/(request-access)/received/[step]/[id]
      router.push(
        `/select-operator/received/request-access/${operatorId}?title=${encodeURIComponent(
          operatorName,
        )}`,
      );
    });
  };

  return (
    <>
      <div className="min-h-6 flex justify-center w-full">{renderedErrors}</div>
      <Button
        className="my-10"
        sx={{ textTransform: "none" }} // to remove uppercase text
        aria-label={label}
        color="primary"
        variant="contained"
        onClick={handleRequestAccess}
        disabled={isPending}
      >
        {label}
      </Button>
    </>
  );
}
