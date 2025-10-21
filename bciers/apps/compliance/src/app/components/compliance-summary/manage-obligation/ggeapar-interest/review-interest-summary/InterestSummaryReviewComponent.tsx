"use client";

import FormBase from "@bciers/components/form/FormBase";
import ComplianceStepButtons from "@/compliance/src/app/components/ComplianceStepButtons";
import {
  createInterestSummaryReviewSchema,
  interestSummaryReviewUiSchema,
} from "@/compliance/src/app/data/jsonSchema/manageObligation/ggeapar-interest/review-interest-summary/interestSummaryReviewSchema";
import { LateSubmissionPenalty } from "@/compliance/src/app/types";

interface Props {
  data: LateSubmissionPenalty;
  reportingYear: number;
  complianceReportVersionId: number;
}

const InterestSummaryReviewComponent = ({
  data,
  reportingYear,
  complianceReportVersionId,
}: Props) => {
  const backUrl = `/compliance-administration/compliance-summaries/${complianceReportVersionId}/pay-obligation-track-payments`;

  return (
    <FormBase
      schema={createInterestSummaryReviewSchema(reportingYear)}
      uiSchema={interestSummaryReviewUiSchema}
      formData={data}
      className="w-full"
    >
      <ComplianceStepButtons
        backUrl={backUrl}
        middleButtonText="Generate Interest Invoice"
        className="mt-44"
      />
    </FormBase>
  );
};

export default InterestSummaryReviewComponent;
