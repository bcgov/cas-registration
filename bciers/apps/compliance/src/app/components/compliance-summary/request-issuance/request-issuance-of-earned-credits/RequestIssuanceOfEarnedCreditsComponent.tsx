"use client";

import { useMemo, useState } from "react";
import FormBase from "@bciers/components/form/FormBase";
import {
  requestIssuanceOfEarnedCreditsSchema,
  requestIssuanceOfEarnedCreditsUiSchema,
} from "@/compliance/src/app/data/jsonSchema/requestIssuance/requestIssuanceOfEarnedCreditsSchema";
import ComplianceStepButtons from "@/compliance/src/app/components/ComplianceStepButtons";
import {
  BccrAccountDetailsResponse,
  RequestIssuanceOfEarnedCreditsFormData,
} from "@/compliance/src/app/types";
import { getBccrAccountDetails } from "@/compliance/src/app/utils/bccrAccountHandlers";
import { IChangeEvent } from "@rjsf/core";
import SubmitButton from "@bciers/components/button/SubmitButton";
import { actionHandler } from "@bciers/actions";
import { useRouter } from "next/navigation";
import { IssuanceStatus } from "@bciers/utils/src/enums";
import {
  useValidationErrors,
  handleApiResponse,
} from "@bciers/components/validationErrors";

interface Props {
  complianceReportVersionId: number;
  data: RequestIssuanceOfEarnedCreditsFormData;
}

const RequestIssuanceOfEarnedCreditsComponent = ({
  data,
  complianceReportVersionId,
}: Readonly<Props>) => {
  const router = useRouter();
  const backUrl = `/compliance-administration/compliance-summaries/${complianceReportVersionId}/review-compliance-earned-credits-report`;
  const saveAndContinueUrl = `/compliance-administration/compliance-summaries/${complianceReportVersionId}/track-status-of-issuance`;

  const [formData, setFormData] =
    useState<Partial<RequestIssuanceOfEarnedCreditsFormData>>(data);
  const { setErrors, renderedErrors } = useValidationErrors();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const idRequiringChange =
    data?.issuance_status === IssuanceStatus.CHANGES_REQUIRED
      ? data.bccr_holding_account_id
      : undefined;

  const disabled =
    "bccr_holding_account_id" in formData
      ? formData.bccr_holding_account_id === idRequiringChange
      : false;

  const handleChange = (
    e: IChangeEvent<RequestIssuanceOfEarnedCreditsFormData>,
  ) => {
    setErrors(undefined);
    const newFormData = e.formData;
    const prevAccountId = (formData as RequestIssuanceOfEarnedCreditsFormData)
      ?.bccr_holding_account_id;
    const newAccountId = newFormData?.bccr_holding_account_id;

    if (newAccountId === idRequiringChange) {
      setFormData(data);
      return;
    }

    if (prevAccountId !== newAccountId) {
      setFormData({
        bccr_holding_account_id: newAccountId,
      });
      return;
    }

    setFormData(newFormData as RequestIssuanceOfEarnedCreditsFormData);
  };

  const canSubmit = useMemo(() => {
    return !!(
      (formData as RequestIssuanceOfEarnedCreditsFormData)?.bccr_trading_name &&
      (formData as RequestIssuanceOfEarnedCreditsFormData)
        ?.bccr_holding_account_id
    );
  }, [formData]);

  const handleSubmit = async (
    e: IChangeEvent<RequestIssuanceOfEarnedCreditsFormData>,
  ) => {
    setIsSubmitting(true);
    setErrors(undefined);

    const response = await actionHandler(
      `compliance/compliance-report-versions/${complianceReportVersionId}/earned-credits`,
      "PUT",
      "",
      {
        body: JSON.stringify(e.formData),
      },
    );

    const isSuccess = handleApiResponse(response, setErrors);
    if (!isSuccess) {
      setIsSubmitting(false);
      return;
    }

    router.push(saveAndContinueUrl);
  };

  return (
    <FormBase
      schema={requestIssuanceOfEarnedCreditsSchema}
      uiSchema={requestIssuanceOfEarnedCreditsUiSchema}
      formData={formData}
      onChange={handleChange}
      onSubmit={handleSubmit}
      formContext={{
        complianceReportVersionId,
        validateBccrAccount: getBccrAccountDetails,
        onValidAccountResolved: (response?: BccrAccountDetailsResponse) =>
          setFormData(
            (prev: Partial<RequestIssuanceOfEarnedCreditsFormData>) => ({
              ...prev,
              ...response,
            }),
          ),
        onError: (err: any) =>
          handleApiResponse(
            {
              error:
                err instanceof Error
                  ? err.message
                  : typeof err === "string"
                    ? err
                    : err?.message ||
                      err?.error ||
                      "An unexpected error occurred.",
            },
            setErrors,
          ),
      }}
      className="w-full min-h-[62vh] flex flex-col justify-between"
    >
      <div>
        {renderedErrors}
        <ComplianceStepButtons backUrl={backUrl} className="mt-4">
          <SubmitButton
            isSubmitting={isSubmitting}
            disabled={!canSubmit || disabled}
          >
            Request Issuance of Earned Credits
          </SubmitButton>
        </ComplianceStepButtons>
      </div>
    </FormBase>
  );
};

export default RequestIssuanceOfEarnedCreditsComponent;
