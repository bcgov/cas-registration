"use client";

import FormBase from "@bciers/components/form/FormBase";
import ComplianceStepButtons from "@/compliance/src/app/components/ComplianceStepButtons";
import {
  penaltySummaryReviewUiSchema,
  createPenaltySummaryReviewSchema,
} from "@/compliance/src/app/data/jsonSchema/manageObligation/automatic-overdue-penalty/review-penalty-summary/penaltySummaryReviewSchema";
import { AutomaticOverduePenalty } from "@/compliance/src/app/types";

interface Props {
  data: AutomaticOverduePenalty;
  reportingYear: number;
  complianceReportVersionId: number;
}

const PenaltySummaryReviewComponent = ({
  data,
  reportingYear,
  complianceReportVersionId,
}: Props) => {
  const backUrl = `/compliance-summaries/${complianceReportVersionId}/pay-obligation-track-payments`;
  const saveAndContinueUrl = `/compliance-summaries/${complianceReportVersionId}/download-payment-instructions`;

  const handleGeneratePenaltyInvoice = () => {
    // TODO: Implement generate penalty invoice logic in task #73
  };

  return (
    <>
      <FormBase
        schema={createPenaltySummaryReviewSchema(reportingYear)}
        uiSchema={penaltySummaryReviewUiSchema}
        formData={data}
        className="w-full"
      >
        <ComplianceStepButtons
          backUrl={backUrl}
          continueUrl={saveAndContinueUrl}
          middleButtonText="Generate Penalty Invoice"
          onMiddleButtonClick={handleGeneratePenaltyInvoice}
          className="mt-44"
        />
      </FormBase>
    </>
  );
};

export default PenaltySummaryReviewComponent;
