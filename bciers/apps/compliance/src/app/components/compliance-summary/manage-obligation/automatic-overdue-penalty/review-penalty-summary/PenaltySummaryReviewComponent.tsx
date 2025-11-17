"use client";

import FormBase from "@bciers/components/form/FormBase";
import ComplianceStepButtons from "@/compliance/src/app/components/ComplianceStepButtons";
import {
  penaltySummaryReviewUiSchema,
  createPenaltySummaryReviewSchema,
} from "@/compliance/src/app/data/jsonSchema/manageObligation/automatic-overdue-penalty/review-penalty-summary/penaltySummaryReviewSchema";
import { AutomaticOverduePenalty } from "@/compliance/src/app/types";
import { useState } from "react";
import generateInvoice from "@/compliance/src/app/utils/generateInvoice";
import { ComplianceInvoiceTypes } from "@bciers/utils/src/enums";
import FormAlerts from "@bciers/components/form/FormAlerts";

interface Props {
  data: AutomaticOverduePenalty;
  reportingYear: number;
  complianceReportVersionId: number;
  isInternalUser: boolean;
}

const PenaltySummaryReviewComponent = ({
  data,
  reportingYear,
  complianceReportVersionId,
  isInternalUser,
}: Props) => {
  const backUrl = `/compliance-administration/compliance-summaries/${complianceReportVersionId}/${
    isInternalUser
      ? "review-compliance-obligation-report"
      : "pay-obligation-track-payments"
  }`;
  const saveAndContinueUrl = `/compliance-administration/compliance-summaries/${complianceReportVersionId}/download-payment-penalty-instructions`;

  const [errors, setErrors] = useState<string[]>([]);
  const [isGeneratingPenaltyInvoice, setIsGeneratingPenaltyInvoice] =
    useState(false);

  const handleGeneratePenaltyInvoice = async () => {
    setErrors([]);
    setIsGeneratingPenaltyInvoice(true);

    try {
      await generateInvoice(
        complianceReportVersionId,
        ComplianceInvoiceTypes.AUTOMATIC_OVERDUE_PENALTY,
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrors([msg]);
    } finally {
      setIsGeneratingPenaltyInvoice(false);
    }
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
          continueUrl={isInternalUser ? undefined : saveAndContinueUrl} // passing undefined will hide the  button because it only shows if this prop is present. Same strategy for the middle button below
          middleButtonDisabled={isGeneratingPenaltyInvoice}
          middleButtonText={
            isGeneratingPenaltyInvoice
              ? "Generating Penalty Invoice..."
              : "Generate Penalty Invoice"
          }
          onMiddleButtonClick={
            isInternalUser ? undefined : handleGeneratePenaltyInvoice
          }
          className="mt-44"
        />
        {/* Render any errors */}
        <FormAlerts key="alerts" errors={errors} />
      </FormBase>
    </>
  );
};

export default PenaltySummaryReviewComponent;
