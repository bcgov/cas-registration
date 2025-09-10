"use client";

import { RequestIssuanceComplianceSummaryData } from "@/compliance/src/app/types";
import ComplianceStepButtons from "@/compliance/src/app/components/ComplianceStepButtons";
import FormBase from "@bciers/components/form/FormBase";
import {
  internalTrackStatusOfIssuanceSchema,
  internalTrackStatusOfIssuanceUiSchema,
} from "@/compliance/src/app/data/jsonSchema/requestIssuance/internal/internalTrackStatusOfIssuanceSchema";
import { FrontEndRoles, IssuanceStatus } from "@bciers/utils/src/enums";
import { useSessionRole } from "@bciers/utils/src/sessionUtils";

interface Props {
  data: RequestIssuanceComplianceSummaryData;
  complianceReportVersionId: number;
}

export default function InternalTrackStatusOfIssuanceComponent({
  data,
  complianceReportVersionId,
}: Readonly<Props>) {
  const role = useSessionRole();
  const isDirector = role === FrontEndRoles.CAS_DIRECTOR;

  let backUrl = `/compliance-summaries/${complianceReportVersionId}/review-by-director`;
  if (
    [IssuanceStatus.APPROVED, IssuanceStatus.DECLINED].includes(
      data.issuance_status as IssuanceStatus,
    )
  ) {
    backUrl = "/compliance-summaries";
  }

  return (
    <FormBase
      schema={internalTrackStatusOfIssuanceSchema}
      uiSchema={internalTrackStatusOfIssuanceUiSchema}
      formData={{ ...data, is_director: isDirector }}
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
