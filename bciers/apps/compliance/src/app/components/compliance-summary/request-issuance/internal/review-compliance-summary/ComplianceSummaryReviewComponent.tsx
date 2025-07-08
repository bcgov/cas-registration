"use client";

import FormBase from "@bciers/components/form/FormBase";
import ComplianceStepButtons from "@/compliance/src/app/components/ComplianceStepButtons";
import {
  complianceSummaryReviewUiSchema,
  createComplianceSummaryReviewSchema,
} from "@/compliance/src/app/data/jsonSchema/requestIssuance/complianceSummaryReviewSchema";
import { RequestIssuanceComplianceSummaryData } from "@/compliance/src/app/types";

interface Props {
  data: RequestIssuanceComplianceSummaryData;
  complianceSummaryId: string;
}

const ComplianceSummaryReviewComponent = ({
  data,
  complianceSummaryId,
}: Readonly<Props>) => {
  const backUrl = "/compliance-summaries";
  const saveAndContinueUrl = `/compliance-summaries/${complianceSummaryId}/review-credits-issuance-request`;

  return (
    <FormBase
      schema={createComplianceSummaryReviewSchema(data.reporting_year)}
      uiSchema={complianceSummaryReviewUiSchema(true)}
      formData={data}
      className="w-full"
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
