"use client";

import ComplianceStepButtons from "@/compliance/src/app/components/ComplianceStepButtons";
import {
  internalComplianceSummaryReviewUiSchema,
  createInternalComplianceSummaryReviewSchema,
} from "@/compliance/src/app/data/jsonSchema/manageObligation/internal/InternalComplianceSummaryReviewSchema";
import { FormBase } from "@bciers/components/form";
import { ComplianceSummary } from "@/compliance/src/app/types";

interface Props {
  data: ComplianceSummary;
}

export function InternalComplianceSummaryReviewComponent({
  data,
}: Readonly<Props>) {
  const backUrl = "/compliance-summaries";

  return (
    <FormBase
      schema={createInternalComplianceSummaryReviewSchema(data.reporting_year)}
      uiSchema={internalComplianceSummaryReviewUiSchema}
      formData={data}
      className="w-full"
    >
      <ComplianceStepButtons backUrl={backUrl} />
    </FormBase>
  );
}
