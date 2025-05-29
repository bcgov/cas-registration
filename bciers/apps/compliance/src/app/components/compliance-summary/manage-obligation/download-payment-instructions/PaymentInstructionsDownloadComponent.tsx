"use client";

import { useState } from "react";
import { FormBase } from "@bciers/components/form";
import ComplianceStepButtons from "../../../ComplianceStepButtons";
import {
  createDownloadPaymentInstructionsSchema,
  downloadPaymentInstructionsUiSchema,
} from "@/compliance/src/app/data/jsonSchema/manageObligation/downloadPaymentInstructionsSchema";

interface Props {
  readonly complianceSummaryId: any;
}

export default function PaymentInstructionsDownloadComponent({
  complianceSummaryId,
}: Props) {
  const backUrl = `/compliance-summaries/${complianceSummaryId}/manage-obligation/review-compliance-summary`;
  const saveAndContinueUrl = `/compliance-summaries/${complianceSummaryId}/manage-obligation/pay-obligation-track-payments`;
  const [isGeneratingDownload, setIsGeneratingDownload] = useState(false);
  const instructionFormData = {
    complianceSummaryId,
    invoiceNumber: "TBD",
    bankName: "Canadian Imperial Bank of Commerce",
    bankTransitNumber: "00090",
    institutionNumber: "010",
    swiftCode: "CIBCCATT",
    accountNumber: "09-70301",
    accountName: "Province of British Columbia-OBPS-BCIERS",
    bankAddress: "1175 DOUGLAS STREET, VICTORIA, BC V8W2E1",
  };

  const handleDownloadInstructions = async () => {
    if (!complianceSummaryId) {
      return;
    }

    try {
      setIsGeneratingDownload(true);

      const instructionsUrl = `/compliance/api/payment-instructions/${complianceSummaryId}`;

      window.open(instructionsUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Error generating payment instructions:", error);
      throw new Error(error instanceof Error ? error.message : String(error));
    } finally {
      setIsGeneratingDownload(false);
    }
  };
  return (
    <FormBase
      schema={createDownloadPaymentInstructionsSchema()}
      uiSchema={downloadPaymentInstructionsUiSchema}
      formData={instructionFormData}
      className="w-full"
    >
      <ComplianceStepButtons
        key="form-buttons"
        backUrl={backUrl}
        continueUrl={saveAndContinueUrl}
        backButtonDisabled={false}
        middleButtonDisabled={isGeneratingDownload}
        submitButtonDisabled={false}
        middleButtonText={"Download Payment Information"}
        onMiddleButtonClick={handleDownloadInstructions}
      />
    </FormBase>
  );
}
