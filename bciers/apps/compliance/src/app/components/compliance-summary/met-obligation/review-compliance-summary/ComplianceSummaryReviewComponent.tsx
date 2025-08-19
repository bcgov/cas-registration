"use client";

import FormBase from "@bciers/components/form/FormBase";
import ComplianceStepButtons from "@/compliance/src/app/components/ComplianceStepButtons";
import { ComplianceSummaryReviewPageData } from "@/compliance/src/app/types";
import {
  complianceSummaryReviewSchema,
  complianceSummaryReviewUiSchema,
} from "@/compliance/src/app/data/jsonSchema/metObligation/complianceSummaryReviewSchema";

interface Props {
  data: ComplianceSummaryReviewPageData;
}

const ComplianceSummaryReviewComponent = ({ data }: Props) => {
  const backUrl = "/compliance-summaries";

  return (
    <FormBase
      schema={complianceSummaryReviewSchema(data.reporting_year)}
      uiSchema={complianceSummaryReviewUiSchema()}
      formData={data}
      className="w-full"
    >
      <ComplianceStepButtons backUrl={backUrl} className="mt-44" />
    </FormBase>
  );
};

export default ComplianceSummaryReviewComponent;
