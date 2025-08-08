"use client";

import ComplianceStepButtons from "@/compliance/src/app/components/ComplianceStepButtons";
import { FormBase } from "@bciers/components/form";
import {
  createPayPenaltyTrackPaymentsSchema,
  payPenaltyTrackPaymentsUiSchema,
} from "@/compliance/src/app/data/jsonSchema/manageObligation/automatic-overdue-penalty/pay-penalty-track-payments/payPenaltyTrackPaymentsSchema";
import { PayPenaltyTrackPaymentsFormData } from "@/compliance/src/app/types";

interface Props {
  readonly data: PayPenaltyTrackPaymentsFormData;
  readonly complianceReportVersionId: number;
}

export function PenaltyTrackPaymentsComponent({
  data,
  complianceReportVersionId,
}: Props) {
  const backUrl = `/compliance-summaries/${complianceReportVersionId}/download-payment-penalty-instructions`;

  return (
    <FormBase
      schema={createPayPenaltyTrackPaymentsSchema()}
      uiSchema={payPenaltyTrackPaymentsUiSchema}
      formData={data}
      formContext={data}
      className="w-full"
    >
      <ComplianceStepButtons backUrl={backUrl} />
    </FormBase>
  );
}
