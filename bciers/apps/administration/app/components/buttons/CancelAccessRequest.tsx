"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UUID } from "crypto";
import SimpleModal from "@bciers/components/modal/SimpleModal";
import cancelAccessRequest from "@/administration/app/components/userOperators/cancelAccessRequest";
import {
  useValidationErrors,
  handleApiResponse,
  setClientError,
} from "@bciers/components/validationErrors";

interface CancelAccessRequestProps {
  userOperatorId: UUID;
}

export default function CancelAccessRequest({
  userOperatorId,
}: Readonly<CancelAccessRequestProps>) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { setErrors, renderedErrors } = useValidationErrors();

  const handleCancelAccessRequest = () => {
    startTransition(async () => {
      setErrors(undefined);
      try {
        const response = await cancelAccessRequest(userOperatorId);

        const isSuccess = handleApiResponse(response, setErrors);
        if (!isSuccess) {
          setModalOpen(false);
          return;
        }

        router.push("/select-operator");
      } catch (err) {
        setClientError(err, setErrors);
        setModalOpen(false);
      }
    });
  };

  return (
    <div>
      <SimpleModal
        title="Confirmation"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onConfirm={handleCancelAccessRequest}
        confirmText="Yes, cancel this request"
        cancelText="No, don't cancel"
        isSubmitting={isPending}
      >
        Are you sure you want to cancel this request?
      </SimpleModal>

      <button
        className="button-link mt-8 text-[#D8292F]"
        aria-label="Cancel Access Request"
        onClick={() => setModalOpen(true)}
      >
        Cancel Request
      </button>

      <div className="min-h-6 mt-4">{renderedErrors}</div>
    </div>
  );
}
