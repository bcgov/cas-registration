"use client";

import FormBase from "@bciers/components/form/FormBase";
import ComplianceStepButtons from "@/compliance/src/app/components/ComplianceStepButtons";
import {
  penaltySummaryReviewUiSchema,
  createPenaltySummaryReviewSchema,
} from "@/compliance/src/app/data/jsonSchema/manageObligation/automatic-overdue-penalty/review-penalty-summary/penaltySummaryReviewSchema";
import { AutomaticOverduePenalty } from "@/compliance/src/app/types";
import { useState } from "react";
import generateInvoice from "@/compliance/src/app/utils/generateInvoice";
import { ComplianceInvoiceTypes } from "@bciers/utils/src/enums";
import {
  useValidationErrors,
  handleApiResponse,
} from "@bciers/components/validationErrors";

interface Props {
  data: AutomaticOverduePenalty;
  reportingYear: number;
  complianceReportVersionId: number;
  hasLateSubmissionPenalty?: boolean;
  outstandingBalance?: number;
}

const PenaltySummaryReviewComponent = ({
  data,
  reportingYear,
  complianceReportVersionId,
  hasLateSubmissionPenalty,
  outstandingBalance,
}: Props) => {
  const isObligationFullyPaid = Number(outstandingBalance) === 0;
  const backUrl = `/compliance-administration/compliance-summaries/${complianceReportVersionId}/${
    isObligationFullyPaid && hasLateSubmissionPenalty
      ? "pay-interest-penalty-track-payments"
      : "pay-obligation-track-payments"
  }`;
  const saveAndContinueUrl = `/compliance-administration/compliance-summaries/${complianceReportVersionId}/download-payment-penalty-instructions`;

  const { setErrors, renderedErrors } = useValidationErrors();
  const [isGeneratingPenaltyInvoice, setIsGeneratingPenaltyInvoice] =
    useState(false);

  const displayPenaltyStatus =
    data.penalty_status === "Not Paid" ? "Due" : data.penalty_status;

  const formData = { ...data, penalty_status: displayPenaltyStatus };

  const handleGeneratePenaltyInvoice = async () => {
    setErrors(undefined);
    setIsGeneratingPenaltyInvoice(true);

    const response = await generateInvoice(
      complianceReportVersionId,
      ComplianceInvoiceTypes.AUTOMATIC_OVERDUE_PENALTY,
    );

    handleApiResponse(response, setErrors);
    setIsGeneratingPenaltyInvoice(false);
  };

  return (
    <>
      <FormBase
        schema={createPenaltySummaryReviewSchema(reportingYear)}
        uiSchema={penaltySummaryReviewUiSchema}
        formData={formData}
        className="w-full"
      >
        {renderedErrors}
        <ComplianceStepButtons
          backUrl={backUrl}
          continueUrl={saveAndContinueUrl}
          middleButtonDisabled={isGeneratingPenaltyInvoice}
          middleButtonText={
            isGeneratingPenaltyInvoice
              ? "Generating Penalty Invoice..."
              : "Generate Penalty Invoice"
          }
          onMiddleButtonClick={handleGeneratePenaltyInvoice}
          className="mt-44"
        />
      </FormBase>
    </>
  );
};

export default PenaltySummaryReviewComponent;
