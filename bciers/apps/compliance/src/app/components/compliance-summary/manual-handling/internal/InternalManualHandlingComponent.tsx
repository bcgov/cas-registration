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

const InternalManualHandlingComponent = ({
  initialFormData,
  complianceReportVersionId,
}: Readonly<Props>) => {
  const userRole = useSessionRole();
  const isCasAnalyst = userRole === FrontEndRoles.CAS_ANALYST;
  const isCasDirector = userRole === FrontEndRoles.CAS_DIRECTOR;

  const [errors, setErrors] = useState<string[] | undefined>();
  const [formData, setFormState] = useState<ManualHandlingData | undefined>(
    initialFormData,
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const backUrl = `/compliance-administration/compliance-summaries/${complianceReportVersionId}/review-compliance-earned-credits-report`;

  const handleFormChange = (e: IChangeEvent<ManualHandlingData>) => {
    setFormState(e.formData);
  };

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }
    setIsSubmitting(true);
    const payload = {
      analyst_comment: formData?.analyst_comment,
      director_decision: formData?.director_decision,
    };
    const endpoint = `compliance/compliance-report-versions/${complianceReportVersionId}/manual-handling`;
    const response = await actionHandler(endpoint, "PUT", "", {
      body: JSON.stringify(payload),
    });

    if (response?.error) {
      setErrors([response.error || "Failed to submit request"]);
      setIsSubmitting(false);
    } else {
      setErrors(undefined);
    }
  };

  return (
    <FormBase
      schema={internalManualHandlingSchema}
      uiSchema={internalManualHandlingUiSchema(
        initialFormData?.analyst_submitted_date || "",
        initialFormData?.analyst_submitted_by || "",
      )}
      formData={{
        ...initialFormData,
        is_cas_analyst: isCasAnalyst,
        is_cas_director: isCasDirector,
      }}
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
        <SubmitButton isSubmitting={isSubmitting}>Submit</SubmitButton>
      </ComplianceStepButtons>
    </FormBase>
  );
};

export default InternalManualHandlingComponent;
