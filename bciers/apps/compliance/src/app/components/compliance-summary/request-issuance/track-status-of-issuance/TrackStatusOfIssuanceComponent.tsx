"use client";

import { RequestIssuanceComplianceSummaryData } from "@/compliance/src/app/types";
import ComplianceStepButtons from "@/compliance/src/app/components/ComplianceStepButtons";
import FormBase from "@bciers/components/form/FormBase";
import {
  trackStatusOfIssuanceSchema,
  trackStatusOfIssuanceUiSchema,
} from "@/compliance/src/app/data/jsonSchema/requestIssuance/trackStatusOfIssuanceSchema";
import { IssuanceStatus } from "@bciers/utils/src/enums";

interface Props {
  data: RequestIssuanceComplianceSummaryData;
  complianceSummaryId: string;
}

export default function TrackStatusOfIssuanceComponent({
  data,
  complianceSummaryId,
}: Readonly<Props>) {
  let backUrl = `/compliance-summaries/${complianceSummaryId}/request-issuance-of-earned-credits`;
  if (
    [
      IssuanceStatus.ISSUANCE_REQUESTED,
      IssuanceStatus.APPROVED,
      IssuanceStatus.DECLINED,
    ].includes(data.issuance_status as IssuanceStatus)
  ) {
    backUrl = "/compliance-summaries";
  }

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
