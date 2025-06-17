"use client";

import { useState } from "react";
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

interface Props {
  complianceSummaryId: string;
}

const RequestIssuanceOfEarnedCreditsComponent = ({
  complianceSummaryId,
}: Readonly<Props>) => {
  const backUrl = `/compliance-summaries/${complianceSummaryId}/request-issuance-review-summary`;
  const saveAndContinueUrl = `/compliance-summaries/${complianceSummaryId}/track-status-of-issuance`;

  const [formData, setFormData] = useState<
    RequestIssuanceOfEarnedCreditsFormData | {}
  >({});
  const [errors, setErrors] = useState<string[] | undefined>();

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

  const canSubmit = () => {
    return (
      (formData as RequestIssuanceOfEarnedCreditsFormData)?.bccr_trading_name &&
      (!errors || errors.length === 0)
    );
  };

  return (
    <FormBase
      schema={requestIssuanceOfEarnedCreditsSchema}
      uiSchema={requestIssuanceOfEarnedCreditsUiSchema}
      formData={formData}
      onChange={handleChange}
      formContext={{
        validateBccrAccount: getBccrAccountDetails,
        onValidAccountResolved: (response?: BccrAccountDetailsResponse) =>
          setFormData((prev: any) => ({
            ...prev,
            ...response,
          })),
        onError: setErrors,
      }}
      className="w-full min-h-[62vh] flex flex-col justify-between"
    >
      <div>
        <FormAlerts errors={errors} />
        <ComplianceStepButtons
          backUrl={backUrl}
          continueUrl={saveAndContinueUrl}
          submitButtonDisabled={!canSubmit()}
          continueButtonText="Requests Issuance of Earned Credits"
          className="mt-4"
        />
      </div>
    </FormBase>
  );
};

export default RequestIssuanceOfEarnedCreditsComponent;
