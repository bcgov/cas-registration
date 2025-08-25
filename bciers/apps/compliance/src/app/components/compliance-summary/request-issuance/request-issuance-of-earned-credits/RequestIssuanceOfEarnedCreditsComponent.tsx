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
import FormAlerts from "@bciers/components/form/FormAlerts";
import { IChangeEvent } from "@rjsf/core";
import SubmitButton from "@bciers/components/button/SubmitButton";
import { actionHandler } from "@bciers/actions";
import { useRouter } from "next/navigation";

interface Props {
  complianceReportVersionId: number;
}

const RequestIssuanceOfEarnedCreditsComponent = ({
  complianceReportVersionId,
}: Readonly<Props>) => {
  const router = useRouter();
  const backUrl = `/compliance-summaries/${complianceReportVersionId}/request-issuance-review-summary`;
  const saveAndContinueUrl = `/compliance-summaries/${complianceReportVersionId}/track-status-of-issuance`;

  const [formData, setFormData] = useState<
    RequestIssuanceOfEarnedCreditsFormData | {}
  >({});
  const [errors, setErrors] = useState<string[] | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: IChangeEvent<RequestIssuanceOfEarnedCreditsFormData>,
  ) => {
    const newFormData = e.formData;
    const prevAccountId = (formData as RequestIssuanceOfEarnedCreditsFormData)
      ?.bccr_holding_account_id;
    const newAccountId = newFormData?.bccr_holding_account_id;

    // If account ID changed, clear everything except the account ID
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
    const response = await actionHandler(
      `compliance/compliance-report-versions/${complianceReportVersionId}/earned-credits`,
      "PUT",
      "",
      {
        body: JSON.stringify(e.formData),
      },
    );
    if (response && !response.error) {
      setErrors(undefined);
      router.push(saveAndContinueUrl);
    } else {
      setErrors([response.error || "Failed to submit request"]);
      setIsSubmitting(false); // we only set isSubmitting to false if there was an error so that the button will remain disabled if user tries to submit again
    }
    setIsSubmitting(false);
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
          setFormData((prev: RequestIssuanceOfEarnedCreditsFormData) => ({
            ...prev,
            ...response,
          })),
        onError: setErrors,
      }}
      className="w-full min-h-[62vh] flex flex-col justify-between"
    >
      <div>
        <FormAlerts errors={errors} />
        <ComplianceStepButtons backUrl={backUrl} className="mt-4">
          <SubmitButton isSubmitting={isSubmitting} disabled={!canSubmit}>
            Requests Issuance of Earned Credits
          </SubmitButton>
        </ComplianceStepButtons>
      </div>
    </FormBase>
  );
};

export default RequestIssuanceOfEarnedCreditsComponent;
