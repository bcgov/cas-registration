"use client";

import ComplianceStepButtons from "@/compliance/src/app/components/ComplianceStepButtons";
import { FormBase } from "@bciers/components/form";
import {
  createPayObligationTrackPaymentsSchema,
  payObligationTrackPaymentsUiSchema,
} from "@/compliance/src/app/data/jsonSchema/manageObligation/payObligationTrackPaymentsSchema";
import { PayObligationTrackPaymentsFormData } from "@/compliance/src/app/types";
import { PenaltyStatus } from "@bciers/utils/src/enums";

interface Props {
  readonly data: PayObligationTrackPaymentsFormData;
  readonly complianceReportVersionId: number;
  readonly outstandingBalance?: number;
  readonly hasLateSubmissionPenalty?: boolean;
  readonly penaltyStatus?: string;
}

export function ObligationTrackPaymentsComponent({
  data,
  complianceReportVersionId,
  outstandingBalance,
  hasLateSubmissionPenalty,
  penaltyStatus,
}: Props) {
  const baseSummaryUrl = `/compliance-administration/compliance-summaries/${complianceReportVersionId}`;
  const backUrl = `${baseSummaryUrl}/download-payment-instructions`;

  const isObligationFullyPaid = Number(outstandingBalance) === 0;

  const hasInterestFlow = isObligationFullyPaid && hasLateSubmissionPenalty;

  const hasAutomaticOverdueFlow =
    isObligationFullyPaid &&
    [PenaltyStatus.NOT_PAID, PenaltyStatus.PAID].includes(
      penaltyStatus as PenaltyStatus,
    );

  const continueUrl = hasInterestFlow
    ? `${baseSummaryUrl}/review-interest-summary`
    : hasAutomaticOverdueFlow
      ? `${baseSummaryUrl}/review-penalty-summary`
      : undefined;

  return (
    <FormBase
      schema={createPayObligationTrackPaymentsSchema()}
      uiSchema={payObligationTrackPaymentsUiSchema}
      formData={data}
      formContext={data}
      className="w-full"
    >
      <ComplianceStepButtons backUrl={backUrl} continueUrl={continueUrl} />
    </FormBase>
  );
}
