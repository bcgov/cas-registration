"use client";

import { useState } from "react";
import FormBase from "@bciers/components/form/FormBase";
import ComplianceStepButtons from "@/compliance/src/app/components/ComplianceStepButtons";
import {
  interestSummaryReviewSchema,
  interestSummaryReviewUiSchema,
} from "@/compliance/src/app/data/jsonSchema/manageObligation/ggeapar-interest/review-interest-summary/interestSummaryReviewSchema";
import { LateSubmissionPenalty } from "@/compliance/src/app/types";
import generateInvoice from "@/compliance/src/app/utils/generateInvoice";
import { ComplianceInvoiceTypes } from "@bciers/utils/src/enums";
import {
  useValidationErrors,
  handleApiResponse,
} from "@bciers/components/validationErrors";

interface Props {
  data: LateSubmissionPenalty;
  complianceReportVersionId: number;
}

const InterestSummaryReviewComponent = ({
  data,
  complianceReportVersionId,
}: Props) => {
  const backUrl = `/compliance-administration/compliance-summaries/${complianceReportVersionId}/pay-obligation-track-payments`;
  const continueUrl = `/compliance-administration/compliance-summaries/${complianceReportVersionId}/download-interest-payment-instructions`;

  const { setErrors, renderedErrors } = useValidationErrors();
  const [isGeneratingInterestInvoice, setIsGeneratingInterestInvoice] =
    useState(false);

  const displayPenaltyStatus =
    data.penalty_status === "Not Paid" ? "Due" : data.penalty_status;

  const formData = { ...data, penalty_status: displayPenaltyStatus };

  const handleGenerateInterestInvoice = async () => {
    setErrors(undefined);
    setIsGeneratingInterestInvoice(true);

    const response = await generateInvoice(
      complianceReportVersionId,
      ComplianceInvoiceTypes.LATE_SUBMISSION_PENALTY,
    );

    handleApiResponse(response, setErrors);
    setIsGeneratingInterestInvoice(false);
  };

  return (
    <FormBase
      schema={interestSummaryReviewSchema}
      uiSchema={interestSummaryReviewUiSchema}
      formData={formData}
      className="w-full"
    >
      {renderedErrors}
      <ComplianceStepButtons
        backUrl={backUrl}
        continueUrl={continueUrl}
        middleButtonDisabled={isGeneratingInterestInvoice}
        middleButtonText={
          isGeneratingInterestInvoice
            ? "Generating Interest Invoice..."
            : "Generate Interest Invoice"
        }
        onMiddleButtonClick={handleGenerateInterestInvoice}
        className="mt-44"
      />
    </FormBase>
  );
};

export default InterestSummaryReviewComponent;
