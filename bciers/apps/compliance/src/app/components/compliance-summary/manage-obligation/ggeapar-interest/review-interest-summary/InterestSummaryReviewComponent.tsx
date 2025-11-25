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
import FormAlerts from "@bciers/components/form/FormAlerts";

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

  const [errors, setErrors] = useState<string[]>([]);
  const [isGeneratingInterestInvoice, setIsGeneratingInterestInvoice] =
    useState(false);

  const displayPenaltyStatus =
    data.penalty_status === "Not Paid" ? "Due" : data.penalty_status;

  const formData = { ...data, penalty_status: displayPenaltyStatus };

  const handleGenerateInterestInvoice = async () => {
    setErrors([]);
    setIsGeneratingInterestInvoice(true);

    try {
      await generateInvoice(
        complianceReportVersionId,
        ComplianceInvoiceTypes.LATE_SUBMISSION_PENALTY,
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrors([msg]);
    } finally {
      setIsGeneratingInterestInvoice(false);
    }
  };

  return (
    <FormBase
      schema={interestSummaryReviewSchema}
      uiSchema={interestSummaryReviewUiSchema}
      formData={formData}
      className="w-full"
    >
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
      {/* Render any errors */}
      <FormAlerts key="alerts" errors={errors} />
    </FormBase>
  );
};

export default InterestSummaryReviewComponent;
