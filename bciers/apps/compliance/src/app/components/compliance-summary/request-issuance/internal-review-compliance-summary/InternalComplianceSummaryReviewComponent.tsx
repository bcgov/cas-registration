"use client";

import ComplianceStepButtons from "@/compliance/src/app/components/ComplianceStepButtons";
import FormBase from "@bciers/components/form/FormBase";
import {
  createInternalComplianceSummaryReviewSchema,
  internalComplianceSummaryReviewUiSchema,
} from "@/compliance/src/app/data/jsonSchema/requestIssuance/internalComplianceSummaryReviewSchema";

interface Props {
  readonly data: any;
  readonly complianceSummaryId: string;
  readonly reportingYear: number;
}

const InternalComplianceSummaryReviewComponent = ({
  data,
  complianceSummaryId,
  reportingYear,
}: Props) => {
  const backUrl = `/compliance-summaries`;
  const saveAndContinueUrl = `/compliance-summaries/${complianceSummaryId}/review-credits-issuance-request`;

  return (
    <FormBase
      schema={createInternalComplianceSummaryReviewSchema(reportingYear)}
      uiSchema={internalComplianceSummaryReviewUiSchema}
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

export { InternalComplianceSummaryReviewComponent };
