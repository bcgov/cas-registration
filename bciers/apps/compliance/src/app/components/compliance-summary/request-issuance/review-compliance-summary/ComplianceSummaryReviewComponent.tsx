"use client";

import FormBase from "@bciers/components/form/FormBase";
import ComplianceStepButtons from "@/compliance/src/app/components/ComplianceStepButtons";
import {
  complianceSummaryReviewUiSchema,
  createComplianceSummaryReviewSchema,
} from "@/compliance/src/app/data/jsonSchema/requestIssuance/complianceSummaryReviewSchema";
import { ComplianceSummaryReviewData } from "@/compliance/src/app/types";

interface Props {
  data: ComplianceSummaryReviewData;
  complianceSummaryId: string;
  isCasStaff: boolean;
}

const ComplianceSummaryReviewComponent = ({
  data,
  complianceSummaryId,
  isCasStaff,
}: Props) => {
  const backUrl = "/compliance-summaries";
  console.log("isCasStaff: ", isCasStaff);
  const saveAndContinueUrl = `/compliance-summaries/${complianceSummaryId}/${
    isCasStaff
      ? "review-credits-issuance-request"
      : "request-issuance-of-earned-credits"
  }`;
  console.log("saveAndContinueUrl: ", saveAndContinueUrl);
  return (
    <FormBase
      schema={createComplianceSummaryReviewSchema(data.reporting_year)}
      uiSchema={complianceSummaryReviewUiSchema(isCasStaff)}
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
