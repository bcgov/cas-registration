"use client";

import { FormBase } from "@bciers/components/form";
import ComplianceStepButtons from "@/compliance/src/app/components/ComplianceStepButtons";
import {
  interestSummaryReviewSchema,
  interestSummaryReviewUiSchema,
} from "@/compliance/src/app/data/jsonSchema/manageObligation/ggeapar-interest/review-interest-summary/interestSummaryReviewSchema";
import { LateSubmissionPenalty } from "@/compliance/src/app/types";
import { PenaltyStatus } from "@bciers/utils/src/enums";

interface Props {
  data: LateSubmissionPenalty;
  complianceReportVersionId: number;
  penaltyStatus?: string;
  outstandingBalance?: number;
}

const InternalInterestSummaryReviewComponent = ({
  data,
  complianceReportVersionId,
  penaltyStatus,
  outstandingBalance,
}: Readonly<Props>) => {
  const backUrl = `/compliance-administration/compliance-summaries/${complianceReportVersionId}/review-compliance-obligation-report`;

  const displayPenaltyStatus =
    data.penalty_status === "Not Paid" ? "Due" : data.penalty_status;

  const formData = { ...data, penalty_status: displayPenaltyStatus };

  const showPenalty =
    Number(outstandingBalance) === 0 &&
    [PenaltyStatus.NOT_PAID, PenaltyStatus.PAID].includes(
      penaltyStatus as PenaltyStatus,
    );

  const continueUrl = showPenalty
    ? `/compliance-administration/compliance-summaries/${complianceReportVersionId}/review-penalty-summary`
    : undefined;

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
        className="mt-44"
      />
    </FormBase>
  );
};

export default InternalInterestSummaryReviewComponent;
