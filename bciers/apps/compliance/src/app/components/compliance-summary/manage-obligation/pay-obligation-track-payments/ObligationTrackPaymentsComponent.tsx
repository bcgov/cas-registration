"use client";

import ComplianceStepButtons from "@/compliance/src/app/components/ComplianceStepButtons";
import { FormBase } from "@bciers/components/form";
import {
  createPayObligationTrackPaymentsSchema,
  payObligationTrackPaymentsUiSchema,
} from "@/compliance/src/app/data/jsonSchema/manageObligation/payObligationTrackPaymentsSchema";
import { PayObligationTrackPaymentsFormData } from "@/compliance/src/app/types";

interface Props {
  readonly data: PayObligationTrackPaymentsFormData;
  readonly complianceReportVersionId: number;
}

export function ObligationTrackPaymentsComponent({
  data,
  complianceReportVersionId,
}: Props) {
  const backUrl = `/compliance-summaries/${complianceReportVersionId}/download-payment-instructions`;
  const saveAndContinueUrl = `/compliance-summaries/${complianceReportVersionId}/review-penalty-summary`;

  return (
    <FormBase
      schema={createPayObligationTrackPaymentsSchema()}
      uiSchema={payObligationTrackPaymentsUiSchema}
      formData={data}
      formContext={data}
      className="w-full"
    >
      <ComplianceStepButtons
        backUrl={backUrl}
        continueUrl={
          data.outstanding_balance === 0 ? saveAndContinueUrl : undefined
        }
      />
    </FormBase>
  );
}
