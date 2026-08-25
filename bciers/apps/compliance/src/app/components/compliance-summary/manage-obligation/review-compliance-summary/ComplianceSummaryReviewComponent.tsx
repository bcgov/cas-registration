"use client";

import ComplianceStepButtons from "@/compliance/src/app/components/ComplianceStepButtons";
import { useState } from "react";
import {
  complianceSummaryReviewUiSchema,
  createComplianceSummaryReviewSchema,
} from "@/compliance/src/app/data/jsonSchema/manageObligation/complianceSummaryReviewSchema";
import { FormBase } from "@bciers/components/form";
import { ComplianceSummaryReviewPageData } from "@/compliance/src/app/types";
import { ComplianceInvoiceTypes } from "@bciers/utils/src/enums";
import generateInvoice from "@/compliance/src/app/utils/generateInvoice";
import {
  useValidationErrors,
  handleApiResponse,
} from "@bciers/components/validationErrors";

interface Props {
  data: ComplianceSummaryReviewPageData;
  complianceReportVersionId: number;
}

export function ComplianceSummaryReviewComponent({
  data,
  complianceReportVersionId,
}: Readonly<Props>) {
  const { setErrors, renderedErrors } = useValidationErrors();
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);

  const backUrl = "/compliance-administration/compliance-summaries";
  const saveAndContinueUrl = `/compliance-administration/compliance-summaries/${complianceReportVersionId}/download-payment-instructions`;

  /**
   * Attempts to fetch and open a compliance invoice PDF in a new window.
   * - Calls the app API route `/compliance/api/invoice/{complianceReportVersionId}`.
   * - If the response is a 4xx/5xx with a JSON payload containing `errors`,
   *   extracts the first error message and stores it in state for display.
   * - If the response is successful (PDF stream), converts it to a Blob,
   *   creates an object URL, and opens it in a new tab.
   */
  const handleGenerateInvoice = async () => {
    setErrors(undefined);
    setIsGeneratingInvoice(true);

    const response = await generateInvoice(
      complianceReportVersionId,
      ComplianceInvoiceTypes.OBLIGATION,
    );

    handleApiResponse(response, setErrors);
    setIsGeneratingInvoice(false);
  };

  return (
    <FormBase
      schema={createComplianceSummaryReviewSchema(
        data.reporting_year,
        Number(data.automatic_overdue_penalty_amount) > 0,
        Number(data.ggeapar_interest_amount) > 0,
      )}
      uiSchema={complianceSummaryReviewUiSchema}
      formData={data}
      className="w-full"
      formContext={{
        reportingYear: data.reporting_year,
        maxCreditUsagePercentage: data.max_credit_usage_percentage,
      }}
    >
      {renderedErrors}
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
