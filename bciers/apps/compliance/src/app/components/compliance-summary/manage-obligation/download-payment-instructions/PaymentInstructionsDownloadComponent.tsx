"use client";

import { useState } from "react";
import { FormBase } from "@bciers/components/form";
import ComplianceStepButtons from "../../../ComplianceStepButtons";
import {
  createDownloadPaymentInstructionsSchema,
  downloadPaymentInstructionsUiSchema,
} from "@/compliance/src/app/data/jsonSchema/manageObligation/downloadPaymentInstructionsSchema";
import FormAlerts from "@bciers/components/form/FormAlerts";

interface Props {
  readonly complianceReportVersionId: number;
  readonly invoiceID: string;
}

export default function PaymentInstructionsDownloadComponent({
  complianceReportVersionId,
  invoiceID,
}: Props) {
  const backUrl = `/compliance-summaries/${complianceReportVersionId}/manage-obligation/review-compliance-summary`;
  const saveAndContinueUrl = `/compliance-summaries/${complianceReportVersionId}/manage-obligation/pay-obligation-track-payments`;
  const [errors, setErrors] = useState<string[]>([]);
  const [isGeneratingDownload, setIsGeneratingDownload] = useState(false);
  const instructionFormData = {
    complianceReportVersionId,
    invoice_number: invoiceID,
    bank_name: "Canadian Imperial Bank of Commerce",
    bank_transit_number: "00090",
    institution_number: "010",
    swift_code: "CIBCCATT",
    account_number: "09-70301",
    account_name: "Province of British Columbia-OBPS-BCIERS",
    bank_address: "1175 DOUGLAS STREET, VICTORIA, BC V8W2E1",
  };

  // Borrowed logic from complianceSummaryReviewComponent
  const handleDownloadInstructions = async () => {
    setErrors([]);
    setIsGeneratingDownload(true);

    try {
      const res = await fetch(
        `/compliance/api/payment-instructions/${complianceReportVersionId}`,
        {
          method: "GET",
          cache: "no-store",
        },
      );

      const contentType = res.headers.get("Content-Type") || "";

      // Handle error or JSON payload
      if (contentType.includes("application/json")) {
        let payload: any = { message: `Failed with status ${res.status}` };

        try {
          payload = await res.json();
        } catch {
          // ignore invalid JSON
        }

        if (typeof payload.message === "string") {
          setErrors([payload.message]);
          return;
        }

        // Generic fallback message
        setErrors([
          `Failed to generate payment instructions (status ${res.status})`,
        ]);
        return;
      }

      // Handle non-JSON response errors
      if (!res.ok) {
        setErrors([
          `Failed to generate payment instructions (status ${res.status})`,
        ]);
        return;
      }

      // Handle PDF response
      const pdfBlob = await res.blob();
      const objectUrl = URL.createObjectURL(pdfBlob);
      window.open(objectUrl, "_blank", "noopener,noreferrer");

      // Cleanup
      setTimeout(() => URL.revokeObjectURL(objectUrl), 30_000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrors([msg]);
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
      <FormAlerts key="alerts" errors={errors} />
    </FormBase>
  );
}
