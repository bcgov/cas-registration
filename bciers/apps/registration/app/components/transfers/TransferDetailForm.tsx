"use client";

import { useState } from "react";
import { Button } from "@mui/material";
import SubmitButton from "@bciers/components/button/SubmitButton";
import { useRouter } from "next/navigation";
import { IChangeEvent } from "@rjsf/core";
import { TransferDetailFormData } from "@/registration/app/components/transfers/types";
import { editTransferUISchema } from "@/registration/app/data/jsonSchema/transfer/transferDetail";
import { actionHandler } from "@bciers/actions";
import SimpleModal from "@bciers/components/modal/SimpleModal";
import { UUID } from "crypto";
import { useSessionRole } from "@bciers/utils/src/sessionUtils";
import { FrontEndRoles } from "@bciers/utils/src/enums";
import { TransferEventStatus } from "@/registration/app/components/transfers/enums";
import { RJSFSchema } from "@rjsf/utils";
import SingleStepTaskListForm from "@bciers/components/form/SingleStepTaskListForm";

interface TransferDetailFormProps {
  formData: TransferDetailFormData;
  transferId: UUID;
  schema: RJSFSchema;
}

export default function TransferDetailForm({
  formData,
  transferId,
  schema,
}: Readonly<TransferDetailFormProps>) {
  // To get the user's role from the session
  const role = useSessionRole();
  const isCasAnalyst = role === FrontEndRoles.CAS_ANALYST;
  const isEditable =
    isCasAnalyst && formData.status === TransferEventStatus.TO_BE_TRANSFERRED;

  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [key, setKey] = useState(Math.random()); // NOSONAR

  const handleCancelTransfer = async () => {
    const endpoint = `registration/transfer-events/${transferId}`;
    setIsSubmitting(true);
    const response = await actionHandler(endpoint, "DELETE", "/transfers");
    if (response?.error) {
      setError(response.error as any);
      setModalOpen(false);
      setIsSubmitting(false);
      return;
    }
    router.push("/transfers");
  };

  const submitHandler = async (e: IChangeEvent) => {
    setError(undefined);
    setIsSubmitting(true);
    const endpoint = `registration/transfer-events/${transferId}`;
    const pathToRevalidate = `/transfers/${transferId}`;
    const response = await actionHandler(endpoint, "PATCH", pathToRevalidate, {
      body: JSON.stringify({
        ...e.formData,
      }),
    });
    setIsSubmitting(false);
    if (!response || response?.error) {
      setDisabled(false);
      setError(response.error as any);
    } else {
      setDisabled(true);
    }
  };

  const backButton = (
    <Button
      variant="outlined"
      type="button"
      onClick={() => router.push("/transfers")}
    >
      Back
    </Button>
  );

  const customButtonSection = (
    <>
      {isEditable ? (
        <div className="flex justify-between mt-4">
          <div>
            {backButton}
            <Button
              variant="contained"
              className="ml-4"
              type="button"
              onClick={() => setModalOpen(true)}
            >
              Cancel Transfer
            </Button>
          </div>
          {disabled ? (
            <Button
              variant="contained"
              onClick={() => {
                setDisabled(false);
                setKey(Math.random());
              }}
            >
              Edit Details
            </Button>
          ) : (
            <SubmitButton disabled={disabled} isSubmitting={isSubmitting}>
              Transfer Entity
            </SubmitButton>
          )}
        </div>
      ) : (
        <div className="text-end">{backButton}</div>
      )}
    </>
  );

  return (
    <div className="w-full flex flex-row mt-8">
      <SimpleModal
        title="Confirmation"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onConfirm={handleCancelTransfer}
        confirmText="Yes, cancel this transfer"
        cancelText="No, don't cancel"
        isSubmitting={isSubmitting}
      >
        Are you sure you want to cancel this transfer?
      </SimpleModal>
      <SingleStepTaskListForm
        key={key}
        disabled={disabled}
        error={error}
        schema={schema}
        uiSchema={editTransferUISchema}
        formData={formData}
        allowEdit={isEditable}
        onSubmit={submitHandler}
        onCancel={() => router.push("/transfers")}
        customButtonSection={customButtonSection}
      />
    </div>
  );
}
