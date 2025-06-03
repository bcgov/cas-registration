"use client";

import FormBase from "@bciers/components/form/FormBase";
import ComplianceStepButtons from "@/compliance/src/app/components/ComplianceStepButtons";
import {
  internalReviewCreditsIssuanceRequestUiSchema,
  internalReviewCreditsIssuanceRequestSchema,
} from "@/compliance/src/app/data/jsonSchema/requestIssuance/internalReviewCreditsIssuanceRequestSchema";
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

  const [fileName, setFileName] = useState(
    formData?.attachment?.file_name || "",
  );
  const [pendingFile, setPendingFile] = useState<File | undefined>();
  const [isUploading, setIsUploading] = useState(false);

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
        // Implement file upload logic here
        // const formData = new FormData();
        // formData.append('file', pendingFile);
        // await uploadFile(formData);
      }

      // Submit the form data to your API
      // await submitFormData(complianceSummaryId, formState);

      // Navigate to the next page on success
      router.push(saveAndContinueUrl);
    } catch (error) {
      throw new Error(`Error submitting form:, ${error}`);
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
        <AttachmentElement
          title="Attachments:"
          fileName={fileName}
          fileId={formData?.attachment?.id}
          onFileChange={handleFileChange}
          isUploading={isUploading}
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
