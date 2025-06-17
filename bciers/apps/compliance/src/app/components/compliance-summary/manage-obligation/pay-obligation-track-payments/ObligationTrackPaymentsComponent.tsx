"use client";

import ComplianceStepButtons from "@/compliance/src/app/components/ComplianceStepButtons";
import { FormBase } from "@bciers/components/form";
import {
  createPayObligationTrackPaymentsSchema,
  payObligationTrackPaymentsUiSchema,
} from "@/compliance/src/app/data/jsonSchema/manageObligation/payObligationTrackPaymentsSchema";

interface Props {
  readonly data: any;
  readonly complianceSummaryId: string;
}

export function ObligationTrackPaymentsComponent({
  data,
  complianceSummaryId,
}: Props) {
  const backUrl = `/compliance-summaries/${complianceSummaryId}/manage-obligation-review-summary`;
  const saveAndContinueUrl = `/compliance-summaries/${complianceSummaryId}/automatic-overdue-penalty`;

  return (
    <FormBase
      schema={createPayObligationTrackPaymentsSchema(Number(data.reportingYear))}
      uiSchema={payObligationTrackPaymentsUiSchema}
      formData={data}
      className="w-full"
    >
      <ComplianceStepButtons
        backUrl={backUrl}
        continueUrl={saveAndContinueUrl}
      />
    </FormBase>
  );
} 