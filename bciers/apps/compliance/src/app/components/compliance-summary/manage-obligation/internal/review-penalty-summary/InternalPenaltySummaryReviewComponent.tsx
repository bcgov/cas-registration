"use client";

import ComplianceStepButtons from "@/compliance/src/app/components/ComplianceStepButtons";
import { FormBase } from "@bciers/components/form";
import {
  createInternalPenaltySummaryReviewSchema,
  internalPenaltySummaryReviewUiSchema,
} from "@/compliance/src/app/data/jsonSchema/manageObligation/internal/InternalPenaltySummaryReviewSchema";
import { AutomaticOverduePenalty } from "@/compliance/src/app/types";

interface Props {
  data: AutomaticOverduePenalty;
  complianceReportVersionId: number;
  hasLateSubmissionPenalty: boolean;
}

export function InternalPenaltySummaryReviewComponent({
  data,
  complianceReportVersionId,
  hasLateSubmissionPenalty,
}: Readonly<Props>) {
  const backUrl = hasLateSubmissionPenalty
    ? `/compliance-administration/compliance-summaries/${complianceReportVersionId}/review-interest-summary`
    : `/compliance-administration/compliance-summaries/${complianceReportVersionId}/review-compliance-obligation-report`;

  return (
    <FormBase
      schema={createInternalPenaltySummaryReviewSchema}
      uiSchema={internalPenaltySummaryReviewUiSchema}
      formData={data}
      className="w-full"
    >
      <ComplianceStepButtons backUrl={backUrl} />
    </FormBase>
  );
}
