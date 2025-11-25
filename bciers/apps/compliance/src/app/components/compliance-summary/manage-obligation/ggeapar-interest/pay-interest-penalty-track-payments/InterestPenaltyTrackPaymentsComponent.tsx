"use client";

import ComplianceStepButtons from "@/compliance/src/app/components/ComplianceStepButtons";
import { FormBase } from "@bciers/components/form";
import {
  createPayInterestPenaltyTrackPaymentsSchema,
  payInterestPenaltyTrackPaymentsUiSchema,
} from "@/compliance/src/app/data/jsonSchema/manageObligation/ggeapar-interest/pay-interest-penalty-track-payments/payInterestPenaltyTrackPaymentsSchema";
import { PayPenaltyTrackPaymentsFormData } from "@/compliance/src/app/types";
import { PenaltyStatus } from "@bciers/utils/src/enums";

interface Props {
  readonly data: PayPenaltyTrackPaymentsFormData;
  readonly complianceReportVersionId: number;
  readonly penaltyStatus?: string;
  readonly outstandingBalance?: number;
}

export function InterestPenaltyTrackPaymentsComponent({
  data,
  complianceReportVersionId,
  penaltyStatus,
  outstandingBalance,
}: Props) {
  const isObligationFullyPaid = Number(outstandingBalance) === 0;
  const hasAutomaticOverdue =
    isObligationFullyPaid &&
    [PenaltyStatus.NOT_PAID, PenaltyStatus.PAID].includes(
      penaltyStatus as PenaltyStatus,
    );

  const continueUrl = hasAutomaticOverdue
    ? `/compliance-administration/compliance-summaries/${complianceReportVersionId}/review-penalty-summary`
    : undefined;
  const backUrl = `/compliance-administration/compliance-summaries/${complianceReportVersionId}/download-interest-payment-instructions`;

  return (
    <FormBase
      schema={createPayInterestPenaltyTrackPaymentsSchema()}
      uiSchema={payInterestPenaltyTrackPaymentsUiSchema}
      formData={data}
      formContext={data}
      className="w-full"
    >
      <ComplianceStepButtons backUrl={backUrl} continueUrl={continueUrl} />
    </FormBase>
  );
}
