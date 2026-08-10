"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UUID } from "crypto";
import SimpleModal from "@bciers/components/modal/SimpleModal";
import cancelAccessRequest from "@/administration/app/components/userOperators/cancelAccessRequest";
import { useFormErrors } from "@reporting/src/hooks/useFormErrors";
import { ReportValidationItem } from "@reporting/src/app/components/shared/validation/types";

interface CancelAccessRequestProps {
  userOperatorId: UUID;
}

const createErrorItem = (message: string): ReportValidationItem => ({
  key: "generic_error",
  error: {
    message,
    severity: "Error",
  },
});

export default function CancelAccessRequest({
  userOperatorId,
}: Readonly<CancelAccessRequestProps>) {
  const router = useRouter();
  const { setErrors, renderedErrors } = useFormErrors();
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCancelAccessRequest = async () => {
    setIsSubmitting(true);

    try {
      const response = await cancelAccessRequest(userOperatorId);

      if (typeof response !== "boolean" && response?.error) {
        setErrors([createErrorItem(response.error)]);
      } else {
        router.push("/select-operator");
      }
    } catch (err: any) {
      setErrors([
        createErrorItem(
          err?.message || "An unexpected error occurred. Please try again.",
        ),
      ]);
    } finally {
      setModalOpen(false);
      setIsSubmitting(false);
    }
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
        isSubmitting={isSubmitting}
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
