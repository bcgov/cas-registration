"use client";

import FormBase from "@bciers/components/form/FormBase";
import ComplianceStepButtons from "@/compliance/src/app/components/ComplianceStepButtons";
import {
  internalReviewCreditsIssuanceRequestUiSchema,
  internalReviewCreditsIssuanceRequestSchema,
} from "@/compliance/src/app/data/jsonSchema/requestIssuance/internal/internalReviewCreditsIssuanceRequestSchema";
import { RequestIssuanceComplianceSummaryData } from "@/compliance/src/app/types";
import { useState } from "react";
import { IChangeEvent } from "@rjsf/core";
import { useRouter } from "next/navigation";
import { useSessionRole } from "@bciers/utils/src/sessionUtils";
import { AnalystSuggestion, FrontEndRoles } from "@bciers/utils/src/enums";
import { actionHandler } from "@bciers/actions";
import FormAlerts from "@bciers/components/form/FormAlerts";
import SubmitButton from "@bciers/components/button/SubmitButton";
interface Props {
  initialFormData: RequestIssuanceComplianceSummaryData;
  complianceReportVersionId: number;
}

const InternalReviewCreditsIssuanceRequestComponent = ({
  initialFormData,
  complianceReportVersionId,
}: Readonly<Props>) => {
  const userRole = useSessionRole();
  const router = useRouter();
  const backUrl = `/compliance-administration/compliance-summaries/${complianceReportVersionId}/review-compliance-earned-credits-report`;
  const continueUrl = `/compliance-administration/compliance-summaries/${complianceReportVersionId}/review-by-director`;

  const isCasAnalyst = userRole === FrontEndRoles.CAS_ANALYST;
  const [errors, setErrors] = useState<string[] | undefined>();
  const [formData, setFormState] = useState<
    RequestIssuanceComplianceSummaryData | undefined
  >(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Consider the suggestion final only if a prior submission exists
  const hasPriorAnalystSubmission = Boolean(
    initialFormData?.analyst_submitted_date ||
      initialFormData?.analyst_submitted_by,
  );
  const isFinalAnalystSuggestion =
    hasPriorAnalystSubmission &&
    (initialFormData?.analyst_suggestion ===
      AnalystSuggestion.READY_TO_APPROVE ||
      initialFormData?.analyst_suggestion ===
        AnalystSuggestion.REQUIRING_SUPPLEMENTARY_REPORT);

  const handleFormChange = (
    e: IChangeEvent<RequestIssuanceComplianceSummaryData>,
  ) => {
    setFormState(e.formData);
  };

  const handleSubmit = async () => {
    // If the user is not a CAS Analyst OR a final suggestion exists, navigate forward
    if (!isCasAnalyst || isFinalAnalystSuggestion) {
      router.push(continueUrl);
      return;
    }
    if (isSubmitting) {
      return;
    }
    setIsSubmitting(true);
    // only send the data that is needed for the update by the analyst
    const payload = {
      analyst_suggestion: formData?.analyst_suggestion,
      analyst_comment: formData?.analyst_comment,
    };
    const endpoint = `compliance/compliance-report-versions/${complianceReportVersionId}/earned-credits`;
    const pathToRevalidate = `/compliance-administration/compliance-summaries/${complianceReportVersionId}/review-by-director`;
    const response = await actionHandler(endpoint, "PUT", pathToRevalidate, {
      body: JSON.stringify(payload),
    });
    if (response && !response.error) {
      router.push(continueUrl);
    } else {
      setErrors([response.error || "Failed to submit request"]);
      setIsSubmitting(false);
    }
  };

  return (
    <FormBase
      schema={internalReviewCreditsIssuanceRequestSchema(isCasAnalyst)}
      uiSchema={internalReviewCreditsIssuanceRequestUiSchema(
        formData?.analyst_submitted_date,
        formData?.analyst_submitted_by,
      )}
      readonly={!isCasAnalyst || isFinalAnalystSuggestion}
      disabled={isSubmitting || isFinalAnalystSuggestion}
      formData={formData}
      onChange={handleFormChange}
      onSubmit={handleSubmit}
      className="w-full min-h-[62vh] flex flex-col justify-between"
    >
      <FormAlerts errors={errors} />
      <ComplianceStepButtons
        backUrl={backUrl}
        submitButtonDisabled={isSubmitting}
        className="mt-8"
      >
        <SubmitButton
          isSubmitting={isSubmitting}
          disabled={!formData?.analyst_suggestion}
        >
          Continue
        </SubmitButton>
      </ComplianceStepButtons>
    </FormBase>
  );
};

export default InternalReviewCreditsIssuanceRequestComponent;
