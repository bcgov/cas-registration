"use client";

import FormBase from "@bciers/components/form/FormBase";
import ComplianceStepButtons from "@/compliance/src/app/components/ComplianceStepButtons";
import {
  internalReviewCreditsIssuanceRequestUiSchema,
  internalReviewCreditsIssuanceRequestSchema,
} from "@/compliance/src/app/data/jsonSchema/requestIssuance/internal/internalReviewCreditsIssuanceRequestSchema";
import AttachmentsElement from "./AttachmentsElement";
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
  const [formState, setFormState] = useState(formData);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFormChange = (e: IChangeEvent) => {
    setFormState(e.formData);
  };

  const handleAddFiles = (newFiles: File[]) => {
    // Separate duplicates from unique files
    const { duplicates, uniqueFiles } = newFiles.reduce(
      (acc, file) => {
        const isDuplicate = uploadedFiles.some(
          (existingFile) =>
            existingFile.name.toLowerCase() === file.name.toLowerCase(),
        );

        if (isDuplicate) {
          acc.duplicates.push(file);
        } else {
          acc.uniqueFiles.push(file);
        }
        return acc;
      },
      { duplicates: [] as File[], uniqueFiles: [] as File[] },
    );

    if (duplicates.length > 0) {
      const fileNames = duplicates.map((f) => `"${f.name}"`).join(", ");
      setError(
        `Skipped duplicate file${
          duplicates.length > 1 ? "s" : ""
        }: ${fileNames}`,
      );
    }

    if (uniqueFiles.length > 0) {
      setUploadedFiles((prev) => [...prev, ...uniqueFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    setError(null);
  };

  const handleContinue = async () => {
    try {
      setIsUploading(true);
      if (uploadedFiles.length > 0) {
        // TBD: Implement file upload logic when the API endpoint is available
        // Example implementation:
        // const formData = new FormData();
        // uploadedFiles.forEach((file, index) => {
        //   formData.append(`file_${index}`, file);
        // });
        // await uploadFiles(formData);
      }

      // TBD: Submit the form data to the API when the endpoint is ready
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
        onCancel={() => setModalOpen(false)}
        onConfirm={() => setModalOpen(false)}
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
          openModal: () => setModalOpen(true),
        }}
        className="w-full"
      >
        <AttachmentsElement
          title="Attachments:"
          onRemoveFile={handleRemoveFile}
          onAddFiles={handleAddFiles}
          isUploading={isUploading}
          error={error}
          uploadedFiles={uploadedFiles}
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
