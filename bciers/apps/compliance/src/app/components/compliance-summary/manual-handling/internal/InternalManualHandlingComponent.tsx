"use client";

import { useState } from "react";
import FormBase from "@bciers/components/form/FormBase";
import ComplianceStepButtons from "@/compliance/src/app/components/ComplianceStepButtons";
import {
  internalManualHandlingSchema,
  internalManualHandlingUiSchema,
} from "@/compliance/src/app/data/jsonSchema/manualHandling/internal/internalManualHandlingSchema";
import { ManualHandlingData } from "@/compliance/src/app/types";
import { IChangeEvent } from "@rjsf/core";
import { useSessionRole } from "@bciers/utils/src/sessionUtils";
import { FrontEndRoles } from "@bciers/utils/src/enums";
import { actionHandler } from "@bciers/actions";
import FormAlerts from "@bciers/components/form/FormAlerts";
import SubmitButton from "@bciers/components/button/SubmitButton";

interface Props {
  initialFormData: ManualHandlingData;
  complianceReportVersionId: number;
}

interface ManualHandlingDataWithInitial extends ManualHandlingData {
  _initial_director_decision: ManualHandlingData["director_decision"] | null;
  is_cas_analyst: boolean;
  is_cas_director: boolean;
}

const InternalManualHandlingComponent = ({
  initialFormData,
  complianceReportVersionId,
}: Readonly<Props>) => {
  const userRole = useSessionRole();
  const isCasAnalyst = userRole === FrontEndRoles.CAS_ANALYST;
  const isCasDirector = userRole === FrontEndRoles.CAS_DIRECTOR;

  const [errors, setErrors] = useState<string[] | undefined>();
  const [formData, setFormData] = useState<ManualHandlingDataWithInitial>({
    ...initialFormData,
    _initial_director_decision: initialFormData.director_decision,
    is_cas_analyst: isCasAnalyst,
    is_cas_director: isCasDirector,
  });

  const [formKey, setFormKey] = useState(0); // remounts form to re-evaluate notes
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Success state for the Submit button
  const [isSuccess, setIsSuccess] = useState(false);

  const backUrl = `/compliance-administration/compliance-summaries/${complianceReportVersionId}/review-compliance-earned-credits-report`;

  const isAnalystLockedByDirector =
    isCasAnalyst && formData._initial_director_decision === "issue_resolved";

  const handleSubmit = async (
    e: IChangeEvent<ManualHandlingDataWithInitial>,
  ) => {
    const submittedData = e.formData!;
    if (isSubmitting) return;
    setIsSubmitting(true);

    const payload = {
      analyst_comment: submittedData.analyst_comment,
      director_decision: submittedData.director_decision,
    };

    const endpoint = `compliance/compliance-report-versions/${complianceReportVersionId}/manual-handling`;
    const pathToRevalidate = `/compliance-administration/compliance-summaries`;

    const response = await actionHandler(endpoint, "PUT", pathToRevalidate, {
      body: JSON.stringify(payload),
    });

    if (response?.error) {
      setErrors([response.error || "Failed to submit request"]);
    } else {
      setErrors(undefined);

      // Update form data
      setFormData((prev) => ({
        ...prev,
        // update field value
        analyst_comment: submittedData.analyst_comment,
        director_decision: submittedData.director_decision,
        // update notes logic
        _initial_director_decision: submittedData.director_decision,
      }));

      setIsSuccess(true);
      // 🕐 Wait for 3 second and then reset success state
      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);

      // force remount so notes widgets re-render
      setFormKey((prev) => prev + 1);
    }

    setIsSubmitting(false);
  };

  return (
    <FormBase
      key={formKey}
      schema={internalManualHandlingSchema}
      uiSchema={internalManualHandlingUiSchema(
        initialFormData.analyst_submitted_date || "",
        initialFormData.analyst_submitted_by || "",
      )}
      formData={formData}
      onSubmit={handleSubmit}
      className="w-full min-h-[62vh] flex flex-col justify-between"
    >
      <FormAlerts errors={errors} />
      <ComplianceStepButtons
        backUrl={backUrl}
        submitButtonDisabled={isSubmitting}
        className="mt-8"
      >
        {!isAnalystLockedByDirector && (
          <SubmitButton isSubmitting={isSubmitting}>
            {isSuccess ? "✅ Success" : "Submit"}
          </SubmitButton>
        )}
      </ComplianceStepButtons>
    </FormBase>
  );
};

export default InternalManualHandlingComponent;
