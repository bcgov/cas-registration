"use client";

import FormBase from "@bciers/components/form/FormBase";
import ComplianceStepButtons from "@/compliance/src/app/components/ComplianceStepButtons";
import {
  complianceSummaryReviewUiSchema,
  createComplianceSummaryReviewSchema,
} from "@/compliance/src/app/data/jsonSchema/requestIssuance/complianceSummaryReviewSchema";
import { useSessionRole } from "@bciers/utils/src/sessionUtils";
import { EarnedCreditsAlertNote } from "@/compliance/src/app/components/compliance-summary/request-issuance/review-compliance-summary/EarnedCreditsAlertNote";

interface Props {
  data: {
    operation_name: string;
    reporting_year: number;
    emissions_attributable_for_compliance: string;
    emission_limit: string;
    excess_emissions: string;
    earned_credits: number;
    issuance_status: string;
    earned_credits_issued?: boolean;
    id?: number;
  };
  complianceSummaryId: string;
}

const ComplianceSummaryReviewComponent = ({
  data,
  complianceSummaryId,
}: Props) => {
  const backUrl = "/compliance-summaries";
  const saveAndContinueUrl = `/compliance-summaries/${complianceSummaryId}/request-issuance-of-earned-credits`;

  const isCasStaff = useSessionRole().startsWith("cas_");

  const uiSchema = {
    ...complianceSummaryReviewUiSchema,
    earnedCreditsAlert: {
      ...complianceSummaryReviewUiSchema.earnedCreditsAlert,
      "ui:widget": isCasStaff ? () => null : EarnedCreditsAlertNote,
    },
  };

  return (
    <FormBase
      schema={createComplianceSummaryReviewSchema(data.reporting_year)}
      uiSchema={uiSchema}
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
