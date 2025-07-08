"use client";

import { RequestIssuanceComplianceSummaryData } from "@/compliance/src/app/types";
import ComplianceStepButtons from "@/compliance/src/app/components/ComplianceStepButtons";
import FormBase from "@bciers/components/form/FormBase";
import {
  trackStatusOfIssuanceSchema,
  trackStatusOfIssuanceUiSchema,
} from "@/compliance/src/app/data/jsonSchema/requestIssuance/trackStatusOfIssuanceSchema";

interface Props {
  data: RequestIssuanceComplianceSummaryData;
  complianceSummaryId: string;
}

export default function TrackStatusOfIssuanceComponent({
  data,
  complianceSummaryId,
}: Readonly<Props>) {
  const backUrl = `/compliance-summaries/${complianceSummaryId}/request-issuance-of-earned-credits`;

  return (
    <FormBase
      schema={trackStatusOfIssuanceSchema}
      uiSchema={trackStatusOfIssuanceUiSchema}
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
