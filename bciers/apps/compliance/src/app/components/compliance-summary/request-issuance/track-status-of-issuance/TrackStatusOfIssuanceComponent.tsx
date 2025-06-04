"use client";

import { RequestIssuanceTrackStatusData } from "@/compliance/src/app/types";
import ComplianceStepButtons from "@/compliance/src/app/components/ComplianceStepButtons";
import FormBase from "@bciers/components/form/FormBase";
import {
  trackStatusOfIssuanceSchema,
  trackStatusOfIssuanceUiSchema,
} from "@/compliance/src/app/data/jsonSchema/requestIssuance/trackStatusOfIssuanceSchema";

interface Props {
  readonly data: RequestIssuanceTrackStatusData;
  readonly complianceSummaryId: string;
}

export default function TrackStatusOfIssuanceComponent({
  data,
  complianceSummaryId,
}: Props) {
  const backUrl = `/compliance-summaries/${complianceSummaryId}/request-issuance-of-earned-credits`;

  return (
    <FormBase
      schema={trackStatusOfIssuanceSchema}
      uiSchema={trackStatusOfIssuanceUiSchema}
      formData={{
        ...data,
        // Copy issuance_status to status_note field to drive the StatusNoteWidget
        // which conditionally renders IssuanceStatusAwaitingNote or IssuanceStatusApprovedNote
        // based on the status value
        status_note: data.issuance_status,
      }}
      className="w-full"
    >
      <ComplianceStepButtons
        key="form-buttons"
        backUrl={backUrl}
        backButtonDisabled={false}
        submitButtonDisabled={false}
      />
    </FormBase>
  );
}
