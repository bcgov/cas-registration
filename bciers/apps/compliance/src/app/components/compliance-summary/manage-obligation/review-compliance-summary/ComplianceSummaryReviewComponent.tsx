"use client";

import ComplianceStepButtons from "@/compliance/src/app/components/ComplianceStepButtons";
import { useState } from "react";
import {
  complianceSummaryReviewUiSchema,
  createComplianceSummaryReviewSchema,
} from "@/compliance/src/app/data/jsonSchema/manageObligation/complianceSummaryReviewSchema";
import { FormBase } from "@bciers/components/form";
import FormAlerts from "@bciers/components/form/FormAlerts";
import { ComplianceSummaryReviewPageData } from "@/compliance/src/app/types";
import { ComplianceInvoiceTypes } from "@bciers/utils/src/enums";
import generateInvoice from "@/compliance/src/app/utils/generateInvoice";

interface Props {
  data: ComplianceSummaryReviewPageData;
  complianceReportVersionId: number;
}

export function ComplianceSummaryReviewComponent({
  data,
  complianceReportVersionId,
}: Readonly<Props>) {
  const [errors, setErrors] = useState<string[]>([]);
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);

  const backUrl = "/compliance-summaries";
  const saveAndContinueUrl = `/compliance-summaries/${complianceReportVersionId}/download-payment-instructions`;

  /**
   * Attempts to fetch and open a compliance invoice PDF in a new window.
   * - Calls the app API route `/compliance/api/invoice/{complianceReportVersionId}`.
   * - If the response is a 4xx/5xx with a JSON payload containing `errors`,
   *   extracts the first error message and stores it in state for display.
   * - If the response is successful (PDF stream), converts it to a Blob,
   *   creates an object URL, and opens it in a new tab.
   */
  const handleGenerateInvoice = async () => {
    setErrors([]);
    setIsGeneratingInvoice(true);

    try {
      await generateInvoice(
        complianceReportVersionId,
        ComplianceInvoiceTypes.OBLIGATION,
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrors([msg]);
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  return (
    <FormBase
      schema={createComplianceSummaryReviewSchema(data.reporting_year)}
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

      {/* Render any errors */}
      <FormAlerts key="alerts" errors={errors} />
    </FormBase>
  );
}
