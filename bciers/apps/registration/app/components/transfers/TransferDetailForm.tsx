"use client";

import { useState } from "react";
import FormBase from "@bciers/components/form/FormBase";
import { Alert, Button } from "@mui/material";
import SubmitButton from "@bciers/components/button/SubmitButton";
import { useRouter } from "next/navigation";
import { IChangeEvent } from "@rjsf/core";
import { TransferDetailFormData } from "@/registration/app/components/transfers/types";
import { editTransferUISchema } from "@/registration/app/data/jsonSchema/transfer/transferDetail";
import TaskList from "@bciers/components/form/components/TaskList";
import { actionHandler } from "@bciers/actions";
import SimpleModal from "@bciers/components/modal/SimpleModal";
import { UUID } from "crypto";
import { useSessionRole } from "@bciers/utils/src/sessionUtils";
import { FrontendMessages, FrontEndRoles } from "@bciers/utils/src/enums";
import { TransferEventStatus } from "@/registration/app/components/transfers/enums";
import { RJSFSchema } from "@rjsf/utils";
import SnackBar from "@bciers/components/form/components/SnackBar";

interface TransferFormProps {
  formData: TransferDetailFormData;
  transferId: UUID;
  schema: RJSFSchema;
}

export default function TransferDetailForm({
  formData,
  transferId,
  schema,
}: Readonly<TransferFormProps>) {
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
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);

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
      return;
    } else {
      setDisabled(true);
      setIsSnackbarOpen(true);
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

  return (
    <div className="w-full flex flex-row mt-8">
      <SnackBar
        isSnackbarOpen={isSnackbarOpen}
        message={FrontendMessages.SUBMIT_CONFIRMATION}
        setIsSnackbarOpen={setIsSnackbarOpen}
      />
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
      <TaskList
        // Hide the task list on mobile
        className="hidden sm:block"
        // hardcoding the task list items because we are not using the SingleStepTaskListForm
        taskListItems={[{ section: "section", title: "Transfer Details" }]}
      />
      <div className="w-full">
        <FormBase
          disabled={disabled}
          schema={schema}
          uiSchema={editTransferUISchema}
          formData={formData}
          onSubmit={submitHandler}
          omitExtraData={true}
        >
          <div className="min-h-6">
            {error && <Alert severity="error">{error}</Alert>}
          </div>
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
                <Button variant="contained" onClick={() => setDisabled(false)}>
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
        </FormBase>
      </div>
    </div>
  );
}
