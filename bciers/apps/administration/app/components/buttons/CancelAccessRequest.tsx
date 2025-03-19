"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@mui/material";
import { UUID } from "crypto";
import SimpleModal from "@bciers/components/modal/SimpleModal";
import cancelAccessRequest from "@/administration/app/components/userOperators/cancelAccessRequest";

interface CancelAccessRequestProps {
  userOperatorId: UUID;
}

export default function CancelAccessRequest({
  userOperatorId,
}: Readonly<CancelAccessRequestProps>) {
  const router = useRouter();
  const [error, setError] = useState(undefined);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCancelAccessRequest = async () => {
    setIsSubmitting(true);
    const response = await cancelAccessRequest(userOperatorId);

    if (typeof response !== "boolean" || response?.error) {
      setError(response.error as any);
      setModalOpen(false);
      setIsSubmitting(false);
      return;
    }
    router.push("/select-operator");
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
      <div className="min-h-6 mt-4">
        {error && <Alert severity="error">{error}</Alert>}
      </div>
    </div>
  );
}
