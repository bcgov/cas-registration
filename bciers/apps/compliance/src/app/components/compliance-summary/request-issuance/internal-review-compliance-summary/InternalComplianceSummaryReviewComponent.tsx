"use client";

import ComplianceStepButtons from "../../../ComplianceStepButtons";
import FormBase from "@bciers/components/form/FormBase";
import {
  createInternalComplianceSummaryReviewSchema,
  internalComplianceSummaryReviewUiSchema,
} from "@/compliance/src/app/data/jsonSchema/requestIssuance/internalComplianceSummaryReviewSchema";

interface Props {
  readonly data: any;
  readonly complianceSummaryId: string;
}

const InternalComplianceSummaryReviewComponent = ({
  data,
  complianceSummaryId,
}: Props) => {
  const backUrl = `/compliance-summaries`;
  const saveAndContinueUrl = `/compliance-summaries/${complianceSummaryId}/review-credits-issuance-request`;

  return (
    <FormBase
      schema={createInternalComplianceSummaryReviewSchema(data.reportingYear)}
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
