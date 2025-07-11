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
import { FrontEndRoles } from "@bciers/utils/src/enums";
import { actionHandler } from "@bciers/actions";
import FormAlerts from "@bciers/components/form/FormAlerts";
import SubmitButton from "@bciers/components/button/SubmitButton";
interface Props {
  initialFormData: RequestIssuanceComplianceSummaryData;
  complianceSummaryId: string;
}

const InternalReviewCreditsIssuanceRequestComponent = ({
  initialFormData,
  complianceSummaryId,
}: Readonly<Props>) => {
  const userRole = useSessionRole();
  const router = useRouter();
  const backUrl = `/compliance-summaries/${complianceSummaryId}/request-issuance-review-summary`;
  const continueUrl = `/compliance-summaries/${complianceSummaryId}/review-by-director`;

  const isCasAnalyst = userRole === FrontEndRoles.CAS_ANALYST;
  const [errors, setErrors] = useState<string[] | undefined>();
  const [formData, setFormState] = useState<
    RequestIssuanceComplianceSummaryData | undefined
  >(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleFormChange = (
    e: IChangeEvent<RequestIssuanceComplianceSummaryData>,
  ) => {
    setFormState(e.formData);
  };

  const handleSubmit = async () => {
    // if the user is not a CAS Analyst, redirect to the continue url
    // this is to prevent the user from submitting the form if they are not a CAS Analyst
    if (!isCasAnalyst) {
      router.push(continueUrl);
      return;
    }
    setIsSubmitting(true);
    // only send the data that is needed for the update by the analyst
    const payload = {
      analyst_suggestion: formData?.analyst_suggestion,
      analyst_comment: formData?.analyst_comment,
    };
    const endpoint = `compliance/compliance-report-versions/${complianceSummaryId}/earned-credits`;
    const pathToRevalidate = `/compliance-summaries/${complianceSummaryId}/review-by-director`;
    const response = await actionHandler(endpoint, "PUT", pathToRevalidate, {
      body: JSON.stringify(payload),
    });
    if (response && !response.error) {
      router.push(continueUrl);
    } else {
      setErrors([response.error || "Failed to submit request"]);
    }
    setIsSubmitting(false);
  };

  return (
    <FormBase
      schema={internalReviewCreditsIssuanceRequestSchema(isCasAnalyst)}
      uiSchema={internalReviewCreditsIssuanceRequestUiSchema(
        formData?.analyst_submitted_date,
        formData?.analyst_submitted_by,
      )}
      readonly={!isCasAnalyst}
      disabled={isSubmitting}
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
