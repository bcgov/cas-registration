"use client";

import ComplianceStepButtons from "@/compliance/src/app/components/ComplianceStepButtons";
import { useState } from "react";
import {
  complianceSummaryReviewUiSchema,
  createComplianceSummaryReviewSchema,
} from "@/compliance/src/app/data/jsonSchema/manageObligation/complianceSummaryReviewSchema";
import { FormBase } from "@bciers/components/form";

interface Props {
  data: any; // TODO: Define a proper type for the data
  complianceSummaryId: string;
}

export function ComplianceSummaryReviewContent({
  data,
  complianceSummaryId,
}: Readonly<Props>) {
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);

  const backUrl = `/compliance-summaries`;
  const saveAndContinueUrl = `/compliance-summaries/${complianceSummaryId}/download-payment-instructions`;

  const handleGenerateInvoice = async () => {
    if (!complianceSummaryId) return;

    try {
      setIsGeneratingInvoice(true);

      const invoiceUrl = `/compliance/api/invoice/${complianceSummaryId}`;

      window.open(invoiceUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Error generating invoice:", error);
      throw new Error(error instanceof Error ? error.message : String(error));
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  return (
    <FormBase
      schema={createComplianceSummaryReviewSchema(data.reportingYear)}
      uiSchema={complianceSummaryReviewUiSchema}
      formData={data}
      className="w-full"
    >
      <ComplianceStepButtons
        backUrl={backUrl}
        continueUrl={saveAndContinueUrl}
        middleButtonDisabled={isGeneratingInvoice}
        middleButtonText={
          isGeneratingInvoice
            ? "Generating Invoice..."
            : "Generate Compliance Invoice"
        }
        onMiddleButtonClick={handleGenerateInvoice}
      />
    </FormBase>
  );
}
