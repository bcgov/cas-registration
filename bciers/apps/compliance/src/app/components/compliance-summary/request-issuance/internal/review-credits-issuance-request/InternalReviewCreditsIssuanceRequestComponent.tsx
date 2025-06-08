"use client";

import FormBase from "@bciers/components/form/FormBase";
import ComplianceStepButtons from "@/compliance/src/app/components/ComplianceStepButtons";
import {
  internalReviewCreditsIssuanceRequestUiSchema,
  internalReviewCreditsIssuanceRequestSchema,
} from "@/compliance/src/app/data/jsonSchema/requestIssuance/internal/internalReviewCreditsIssuanceRequestSchema";
import AttachmentElement from "./InternalReviewCreditsIssuanceRequestAttachmentElement";
import { useState } from "react";
import { IChangeEvent } from "@rjsf/core";
import SimpleModal from "@bciers/components/modal/SimpleModal";
import { useRouter } from "next/navigation";

interface Props {
  formData: any;
  complianceSummaryId: string;
}

const InternalReviewCreditsIssuanceRequestComponent = ({
  formData,
  complianceSummaryId,
}: Props) => {
  const backUrl = `/compliance-summaries/${complianceSummaryId}/review-compliance-summary`;
  const saveAndContinueUrl = `/compliance-summaries/${complianceSummaryId}/review-by-director`;
  const router = useRouter();

  const [modalOpen, setModalOpen] = useState(false);

  const handleViewReport = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const [formState, setFormState] = useState(formData);

  const [fileName, setFileName] = useState("");
  const [pendingFile, setPendingFile] = useState<File | undefined>();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormChange = (e: IChangeEvent) => {
    setFormState(e.formData);
  };

  const handleFileChange = (file: File | undefined) => {
    setFileName(file?.name || "");
    setPendingFile(file);
  };

  const handleContinue = async () => {
    try {
      setIsUploading(true);
      if (pendingFile) {
        // TBD: Implement file upload logic when the API endpoint is available
        // Example implementation:
        // const formData = new FormData();
        // formData.append('file', pendingFile);
        // await uploadFile(formData);
        // Note: Error handling and response validation will be added as part of the implementation
      }

      // TBD: Submit the form data to the API when the endpoint is ready
      // await submitFormData(complianceSummaryId, formState);

      // Navigate to the next page on success
      router.push(saveAndContinueUrl);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred during submission",
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <SimpleModal
        open={modalOpen}
        onCancel={handleCloseModal}
        onConfirm={handleCloseModal}
        title="Annual Emissions Report"
      >
        Annual Emissions Report
      </SimpleModal>
      <FormBase
        schema={internalReviewCreditsIssuanceRequestSchema()}
        uiSchema={internalReviewCreditsIssuanceRequestUiSchema}
        formData={formState}
        onChange={handleFormChange}
        formContext={{
          creditsIssuanceRequestData: formState,
          openModal: handleViewReport,
        }}
        className="w-full"
      >
        {error && <div className="text-red-600 text-sm mb-4">{error}</div>}
        <AttachmentElement
          title="Attachments:"
          fileName={fileName}
          onFileChange={handleFileChange}
          isUploading={isUploading}
          error={error}
        />
        <ComplianceStepButtons
          backUrl={backUrl}
          onContinueClick={handleContinue}
        />
      </FormBase>
    </>
  );
};

export default InternalReviewCreditsIssuanceRequestComponent;
