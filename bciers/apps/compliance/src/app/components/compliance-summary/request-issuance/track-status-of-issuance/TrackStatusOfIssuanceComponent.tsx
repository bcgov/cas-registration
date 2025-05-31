"use client";

import { RequestIssuanceTrackStatusData } from "@/compliance/src/app/utils/getRequestIssuanceTrackStatusData";
import ComplianceStepButtons from "@/compliance/src/app/components/ComplianceStepButtons";
import FormBase from "@bciers/components/form/FormBase";
import {
  trackStatusOfIssuanceSchema,
  trackStatusOfIssuanceUiSchema,
} from "@/compliance/src/app/data/jsonSchema/requestIssuance/trackStatusOfIssuanceSchema";

interface Props {
  readonly data: RequestIssuanceTrackStatusData;
  readonly complianceSummaryId: any;
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
