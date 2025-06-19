"use client";

import FormBase from "@bciers/components/form/FormBase";
import ComplianceStepButtons from "@/compliance/src/app/components/ComplianceStepButtons";
import {
  internalReviewByDirectorSchema,
  internalReviewByDirectorUiSchema,
} from "@/compliance/src/app/data/jsonSchema/requestIssuance/internal/internalReviewByDirectorSchema";
import { useState } from "react";
import { IChangeEvent } from "@rjsf/core";
import { DirectorReviewData } from "@/compliance/src/app/types";
import { useSessionRole } from "@bciers/utils/src/sessionUtils";

interface Props {
  initialFormData: DirectorReviewData;
  complianceSummaryId: string;
}

const InternalReviewByDirectorComponent = ({
  initialFormData,
  complianceSummaryId,
}: Props) => {
  const backUrl = `/compliance-summaries/${complianceSummaryId}/review-credits-issuance-request`;
  // TODO: Uncomment after Ticket #166 is implemented
  // const saveAndContinueUrl = `/compliance-summaries/${complianceSummaryId}`;
  // const router = useRouter();

  const userRole = useSessionRole();
  const isReadOnly = userRole !== "cas_director";
  const isActionDisabled =
    isReadOnly || initialFormData?.analyst_recommendation === "require_changes";

  const data = {
    ...initialFormData,
    read_only: isReadOnly,
    editable_director_comment: initialFormData.director_comment,
    readonly_director_comment: initialFormData.director_comment,
  };
  const [formData, setFormState] = useState(data);

  const handleFormChange = (e: IChangeEvent) => {
    setFormState(e.formData);
  };

  const handleApprove = async () => {
    try {
      if (formData.analyst_recommendation === "require_changes") {
        return;
      }

      // TBD: Implement API integration for approval submission (Ticket #166)
      // await submitDirectorDecision(complianceSummaryId, updatedFormData, "approved");

      // router.push(saveAndContinueUrl);
    } catch (error) {
      throw new Error(`Error approving request: ${error}`);
    }
  };

  const handleDecline = async () => {
    try {
      if (formData.analyst_recommendation === "require_changes") {
        return;
      }

      // TBD: API integration for decline submission (Ticket #166)
      // await submitDirectorDecision(complianceSummaryId, updatedFormData, "declined");

      // router.push(saveAndContinueUrl);
    } catch (error) {
      throw new Error(`Error declining request: ${error}`);
    }
  };

  return (
    <FormBase
      schema={internalReviewByDirectorSchema}
      uiSchema={internalReviewByDirectorUiSchema}
      formData={formData}
      onChange={handleFormChange}
      formContext={{
        creditsIssuanceRequestData: formData,
      }}
      className="w-full"
    >
      <ComplianceStepButtons
        onMiddleButtonClick={handleDecline}
        onContinueClick={handleApprove}
        backUrl={backUrl}
        middleButtonText="Decline"
        continueButtonText="Approve"
        middleButtonDisabled={isActionDisabled}
        submitButtonDisabled={isActionDisabled}
      />
    </FormBase>
  );
};

export default InternalReviewByDirectorComponent;
