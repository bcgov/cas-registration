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
import FormAlerts from "@bciers/components/form/FormAlerts";
import { actionHandler } from "@bciers/actions";
import SubmitButton from "@bciers/components/button/SubmitButton";

interface Props {
  data: RequestIssuanceComplianceSummaryData;
  complianceSummaryId: string;
}

const InternalReviewByDirectorComponent = ({
  data,
  complianceSummaryId,
}: Props) => {
  const router = useRouter();
  const userRole = useSessionRole();
  const continueUrl = `/compliance-summaries/${complianceSummaryId}/track-status-of-issuance`;

  let backUrl = `/compliance-summaries/${complianceSummaryId}/review-credits-issuance-request`;
  if (
    [IssuanceStatus.DECLINED].includes(data.issuance_status as IssuanceStatus)
  ) {
    backUrl = "/compliance-summaries";
  }

  const [formData, setFormState] = useState(data);
  const [errors, setErrors] = useState<string[] | undefined>();
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
      setErrors(["You are not authorized to submit this request"]);
      return;
    }
    setIsSubmitting(true);
    // only send the data that is needed for the update by the director
    const payload = {
      director_comment: formData?.director_comment,
      director_decision: decision,
    };
    const endpoint = `compliance/compliance-report-versions/${complianceSummaryId}/earned-credits`;
    const pathToRevalidate = `/compliance-summaries/${complianceSummaryId}/track-status-of-issuance`;
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
      <FormAlerts errors={errors} />
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
