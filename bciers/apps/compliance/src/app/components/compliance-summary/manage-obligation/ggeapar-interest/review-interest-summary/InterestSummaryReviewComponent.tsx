"use client";

import FormBase from "@bciers/components/form/FormBase";
import ComplianceStepButtons from "@/compliance/src/app/components/ComplianceStepButtons";
import {
  interestSummaryReviewSchema,
  interestSummaryReviewUiSchema,
} from "@/compliance/src/app/data/jsonSchema/manageObligation/ggeapar-interest/review-interest-summary/interestSummaryReviewSchema";
import { LateSubmissionPenalty } from "@/compliance/src/app/types";

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

  const displayPenaltyStatus =
    data.penalty_status === "Not Paid" ? "Due" : data.penalty_status;

  const formData = { ...data, penalty_status: displayPenaltyStatus };

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
        middleButtonText="Generate Interest Invoice"
        className="mt-44"
      />
    </FormBase>
  );
};

export default InterestSummaryReviewComponent;
