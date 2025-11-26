"use client";

import ComplianceStepButtons from "@/compliance/src/app/components/ComplianceStepButtons";
import {
  internalComplianceSummaryReviewUiSchema,
  createInternalComplianceSummaryReviewSchema,
} from "@/compliance/src/app/data/jsonSchema/manageObligation/internal/InternalComplianceSummaryReviewSchema";
import { FormBase } from "@bciers/components/form";
import { ComplianceSummary } from "@/compliance/src/app/types";
import { PenaltyStatus } from "@bciers/utils/src/enums";

interface Props {
  data: ComplianceSummary;
  complianceReportVersionId: number;
}

export function InternalComplianceSummaryReviewComponent({
  data,
  complianceReportVersionId,
}: Readonly<Props>) {
  const backUrl = "/compliance-administration/compliance-summaries";

  const {
    reporting_year: reportingYear,
    has_late_submission_penalty: hasLateSubmissionPenalty,
    penalty_status: penaltyStatus,
    outstanding_balance_tco2e: outstandingBalance,
  } = data;

  const showPenalty =
    Number(outstandingBalance) === 0 &&
    [PenaltyStatus.NOT_PAID, PenaltyStatus.PAID].includes(
      penaltyStatus as PenaltyStatus,
    );

  const continueUrl = hasLateSubmissionPenalty
    ? `/compliance-administration/compliance-summaries/${complianceReportVersionId}/review-interest-summary`
    : showPenalty
      ? `/compliance-administration/compliance-summaries/${complianceReportVersionId}/review-penalty-summary`
      : undefined;

  return (
    <FormBase
      schema={createInternalComplianceSummaryReviewSchema(reportingYear)}
      uiSchema={internalComplianceSummaryReviewUiSchema}
      formData={data}
      className="w-full"
    >
      <ComplianceStepButtons backUrl={backUrl} continueUrl={continueUrl} />
    </FormBase>
  );
}
