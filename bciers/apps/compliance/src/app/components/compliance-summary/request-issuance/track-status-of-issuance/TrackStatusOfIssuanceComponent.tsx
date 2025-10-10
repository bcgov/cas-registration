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
  complianceReportVersionId: number;
}

export default function TrackStatusOfIssuanceComponent({
  data,
  complianceReportVersionId,
}: Readonly<Props>) {
  let backUrl = `/compliance-administration/compliance-summaries/${complianceReportVersionId}/request-issuance-of-earned-credits`;
  if (
    [
      IssuanceStatus.ISSUANCE_REQUESTED,
      IssuanceStatus.APPROVED,
      IssuanceStatus.DECLINED,
    ].includes(data.issuance_status as IssuanceStatus)
  ) {
    backUrl = "/compliance-administration/compliance-summaries";
  }

  return (
    <FormBase
      schema={trackStatusOfIssuanceSchema}
      uiSchema={trackStatusOfIssuanceUiSchema}
      formData={data}
      className="w-full"
      formContext={{ analystSuggestion: data.analyst_suggestion }}
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
