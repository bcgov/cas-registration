"use client";

import FormBase from "@bciers/components/form/FormBase";
import ComplianceStepButtons from "@/compliance/src/app/components/ComplianceStepButtons";
import {
  internalReviewByDirectorSchema,
  internalReviewByDirectorUiSchema,
} from "@/compliance/src/app/data/jsonSchema/requestIssuance/internal/internalReviewByDirectorSchema";
import { useState } from "react";
import { IChangeEvent } from "@rjsf/core";
import { RequestIssuanceComplianceSummaryData } from "@/compliance/src/app/types";
import { useSessionRole } from "@bciers/utils/src/sessionUtils";
import { useRouter } from "next/navigation";
import {
  AnalystSuggestion,
  FrontEndRoles,
  IssuanceStatus,
} from "@bciers/utils/src/enums";
import { actionHandler } from "@bciers/actions";
import SubmitButton from "@bciers/components/button/SubmitButton";
import {
  useValidationErrors,
  handleApiResponse,
  createGenericValidationError,
} from "@bciers/components/validationErrors";

interface Props {
  data: RequestIssuanceComplianceSummaryData;
  complianceReportVersionId: number;
}

const InternalReviewByDirectorComponent = ({
  data,
  complianceReportVersionId,
}: Props) => {
  const router = useRouter();
  const userRole = useSessionRole();
  const continueUrl = `/compliance-administration/compliance-summaries/${complianceReportVersionId}/track-status-of-issuance`;

  let backUrl = `/compliance-administration/compliance-summaries/${complianceReportVersionId}/review-credits-issuance-request`;
  if (
    [IssuanceStatus.DECLINED].includes(data.issuance_status as IssuanceStatus)
  ) {
    backUrl = "/compliance-administration/compliance-summaries";
  }

  const [formData, setFormState] = useState(data);
  const { setErrors, renderedErrors } = useValidationErrors();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const isCasDirector = userRole === FrontEndRoles.CAS_DIRECTOR;

  const isActionEnabled =
    isCasDirector &&
    data?.analyst_suggestion === AnalystSuggestion.READY_TO_APPROVE;

  const isActionVisible =
    isCasDirector &&
    [
      IssuanceStatus.ISSUANCE_REQUESTED,
      IssuanceStatus.CHANGES_REQUIRED,
    ].includes(data?.issuance_status as IssuanceStatus);

  const handleFormChange = (e: IChangeEvent) => {
    setFormState(e.formData);
  };

  const handleSubmit = async (decision: "Approved" | "Declined") => {
    if (!isCasDirector) {
      setErrors([
        createGenericValidationError(
          "You are not authorized to submit this request.",
        ),
      ]);
      return;
    }
    if (isSubmitting) {
      return;
    }
    setIsSubmitting(true);
    setErrors(undefined);

    // only send the data that is needed for the update by the director
    const payload = {
      director_comment: formData?.director_comment,
      director_decision: decision,
    };
    const endpoint = `compliance/compliance-report-versions/${complianceReportVersionId}/earned-credits`;
    const pathToRevalidate = `/compliance-administration/compliance-summaries/${complianceReportVersionId}/track-status-of-issuance`;
    const response = await actionHandler(endpoint, "PUT", pathToRevalidate, {
      body: JSON.stringify(payload),
    });

    const isSuccess = handleApiResponse(response, setErrors);
    if (isSuccess) {
      router.push(continueUrl);
    } else {
      setIsSubmitting(false);
    }
  };

  const isReadOnly =
    !isCasDirector ||
    data?.analyst_suggestion !== AnalystSuggestion.READY_TO_APPROVE;

  return (
    <FormBase
      schema={internalReviewByDirectorSchema}
      uiSchema={internalReviewByDirectorUiSchema}
      readonly={isReadOnly}
      disabled={isSubmitting}
      formData={formData}
      onChange={handleFormChange}
      className="w-full min-h-[62vh] flex flex-col justify-between"
    >
      {renderedErrors}
      <ComplianceStepButtons backUrl={backUrl} className="mt-8">
        {isActionVisible && (
          <>
            <SubmitButton
              isSubmitting={isSubmitting}
              variant="outlined"
              onClick={() => handleSubmit("Declined")}
              disabled={!isActionEnabled || isSubmitting}
            >
              Decline
            </SubmitButton>
            <SubmitButton
              isSubmitting={isSubmitting}
              onClick={() => handleSubmit("Approved")}
              disabled={!isActionEnabled || isSubmitting}
            >
              Approve
            </SubmitButton>
          </>
        )}
      </ComplianceStepButtons>
    </FormBase>
  );
};

export default InternalReviewByDirectorComponent;
