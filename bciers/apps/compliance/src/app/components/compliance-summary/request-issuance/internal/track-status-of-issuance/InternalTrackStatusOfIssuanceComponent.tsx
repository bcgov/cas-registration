"use client";

import { RequestIssuanceTrackStatusData } from "@/compliance/src/app/types";
import ComplianceStepButtons from "@/compliance/src/app/components/ComplianceStepButtons";
import FormBase from "@bciers/components/form/FormBase";
import {
  internalTrackStatusOfIssuanceSchema,
  internalTrackStatusOfIssuanceUiSchema,
} from "@/compliance/src/app/data/jsonSchema/requestIssuance/internal/internalTrackStatusOfIssuanceSchema";

interface Props {
  readonly data: RequestIssuanceTrackStatusData;
  readonly complianceSummaryId: string;
}

export default function InternalTrackStatusOfIssuanceComponent({
  data,
  complianceSummaryId,
}: Props) {
  const backUrl = `/compliance-summaries/${complianceSummaryId}/review-by-director`;

  return (
    <FormBase
      schema={internalTrackStatusOfIssuanceSchema}
      uiSchema={internalTrackStatusOfIssuanceUiSchema}
      formData={data}
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
