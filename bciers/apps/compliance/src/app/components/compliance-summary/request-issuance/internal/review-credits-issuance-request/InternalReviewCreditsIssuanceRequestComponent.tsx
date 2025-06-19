"use client";

import FormBase from "@bciers/components/form/FormBase";
import ComplianceStepButtons from "@/compliance/src/app/components/ComplianceStepButtons";
import {
  internalReviewCreditsIssuanceRequestUiSchema,
  internalReviewCreditsIssuanceRequestSchema,
} from "@/compliance/src/app/data/jsonSchema/requestIssuance/internal/internalReviewCreditsIssuanceRequestSchema";
import { CreditsIssuanceRequestData } from "@/compliance/src/app/types";
import AttachmentsElement from "./AttachmentsElement";
import { useState } from "react";
import { IChangeEvent } from "@rjsf/core";
import { useRouter } from "next/navigation";
import { useSessionRole } from "@bciers/utils/src/sessionUtils";

interface Props {
  initialFormData: CreditsIssuanceRequestData;
  complianceSummaryId: string;
}

const InternalReviewCreditsIssuanceRequestComponent = ({
  initialFormData,
  complianceSummaryId,
}: Props) => {
  const userRole = useSessionRole();
  const isCasStaff = userRole.startsWith("cas_");
  const backUrl = `/compliance-summaries/${complianceSummaryId}/${
    isCasStaff ? "request-issuance-review-summary" : "review-compliance-summary"
  }`;
  const saveAndContinueUrl = `/compliance-summaries/${complianceSummaryId}/review-by-director`;
  const router = useRouter();

  const isReadOnly = userRole !== "cas_analyst";

  const [formData, setFormState] = useState(initialFormData);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
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
        // TBD: Implement file upload logic when the API endpoint is available (Ticket #166)
        // Example implementation:
        // const formData = new FormData();
        // uploadedFiles.forEach((file, index) => {
        //   formData.append(`file_${index}`, file);
        // });
        // await uploadFiles(formData);
      }

      // TBD: Submit the form data to the API when the endpoint is ready (Ticket #166)
      // await submitFormData(complianceSummaryId, formData);

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
    <FormBase
      schema={internalReviewCreditsIssuanceRequestSchema}
      uiSchema={internalReviewCreditsIssuanceRequestUiSchema(isReadOnly)}
      formData={formData}
      onChange={handleFormChange}
      formContext={{
        creditsIssuanceRequestData: formData,
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
        readOnly={isReadOnly}
      />
      <ComplianceStepButtons
        backUrl={backUrl}
        onContinueClick={handleContinue}
      />
    </FormBase>
  );
};

export default InternalReviewCreditsIssuanceRequestComponent;
