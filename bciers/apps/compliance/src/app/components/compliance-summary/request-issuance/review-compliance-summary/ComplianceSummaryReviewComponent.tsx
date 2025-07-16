"use client";

import FormBase from "@bciers/components/form/FormBase";
import ComplianceStepButtons from "@/compliance/src/app/components/ComplianceStepButtons";
import {
  complianceSummaryReviewUiSchema,
  createComplianceSummaryReviewSchema,
} from "@/compliance/src/app/data/jsonSchema/requestIssuance/complianceSummaryReviewSchema";
import { RequestIssuanceComplianceSummaryData } from "@/compliance/src/app/types";
import { useSessionRole } from "@bciers/utils/src/sessionUtils";

interface Props {
  data: RequestIssuanceComplianceSummaryData;
  complianceSummaryId: string;
}

const ComplianceSummaryReviewComponent = ({
  data,
  complianceSummaryId,
}: Readonly<Props>) => {
  const isCasStaff = useSessionRole().includes("cas_");
  const backUrl = "/compliance-summaries";

  let saveAndContinueUrl = `/compliance-summaries/${complianceSummaryId}/request-issuance-of-earned-credits`;
  if (isCasStaff) {
    saveAndContinueUrl = `/compliance-summaries/${complianceSummaryId}/review-credits-issuance-request`;
  }

  return (
    <FormBase
      schema={createComplianceSummaryReviewSchema(data.reporting_year)}
      uiSchema={complianceSummaryReviewUiSchema(isCasStaff)}
      formData={data}
      className="w-full min-h-[62vh] flex flex-col justify-between"
    >
      <ComplianceStepButtons
        backUrl={backUrl}
        continueUrl={saveAndContinueUrl}
        className="mt-44"
      />
    </FormBase>
  );
};

export default ComplianceSummaryReviewComponent;
