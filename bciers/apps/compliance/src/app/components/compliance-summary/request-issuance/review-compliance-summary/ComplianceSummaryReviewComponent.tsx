"use client";

import FormBase from "@bciers/components/form/FormBase";
import ComplianceStepButtons from "@/compliance/src/app/components/ComplianceStepButtons";
import { complianceSummaryReviewUiSchema, createComplianceSummaryReviewSchema } from "@/compliance/src/app/data/jsonSchema/requestIssuance/complianceSummaryReviewSchema";

interface Props {
  data: any; //TODO: Define the type for the data
  complianceSummaryId: string;
}

const ComplianceSummaryReviewComponent = ({
  data,
  complianceSummaryId,
}: Props) => {
  const backUrl = "/compliance-summaries";
  const saveAndContinueUrl = `/compliance-summaries/${complianceSummaryId}/request-issuance-of-earned-credits`;

  return (
    <FormBase
      schema={createComplianceSummaryReviewSchema(data.reportingYear)}
      uiSchema={complianceSummaryReviewUiSchema}
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
