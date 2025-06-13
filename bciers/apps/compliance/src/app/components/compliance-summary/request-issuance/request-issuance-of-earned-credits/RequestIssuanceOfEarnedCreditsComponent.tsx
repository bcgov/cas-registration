"use client";

import { useState } from "react";
import FormBase from "@bciers/components/form/FormBase";
import {
  requestIssuanceOfEarnedCreditsSchema,
  requestIssuanceOfEarnedCreditsUiSchema,
} from "@/compliance/src/app/data/jsonSchema/requestIssuance/requestIssuanceOfEarnedCreditsSchema";
import ComplianceStepButtons from "@/compliance/src/app/components/ComplianceStepButtons";
import { BccrAccountDetailsResponse } from "@/compliance/src/app/types";
import { getBccrAccountDetails } from "@/compliance/src/app/utils/bccrAccountHandlers";

interface Props {
  complianceSummaryId: string;
}

const RequestIssuanceOfEarnedCreditsComponent = ({
  complianceSummaryId,
}: Props) => {
  const backUrl = `/compliance-summaries/${complianceSummaryId}/request-issuance-review-summary`;
  const saveAndContinueUrl = `/compliance-summaries/${complianceSummaryId}/track-status-of-issuance`;

  const [formData, setFormData] = useState<any>({});

  const handleChange = (e: any) => {
    const newFormData = e.formData;
    const prevAccountId = formData.bccr_holding_account_id;
    const newAccountId = newFormData.bccr_holding_account_id;

    // If account ID changed and is not 15 digits, clear everything except the account ID
    if (
      prevAccountId !== newAccountId &&
      (!newAccountId || newAccountId.length !== 15)
    ) {
      setFormData({
        bccr_holding_account_id: newAccountId,
      });
      return;
    }

    setFormData(newFormData);
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
            bccr_trading_name: response?.bccr_trading_name ?? undefined,
          })),
      }}
      className="w-full"
    >
      <ComplianceStepButtons
        backUrl={backUrl}
        continueUrl={saveAndContinueUrl}
        submitButtonDisabled={!formData.bccr_trading_name}
        continueButtonText="Requests Issuance of Earned Credits"
        className="mt-44"
      />
    </FormBase>
  );
};

export default RequestIssuanceOfEarnedCreditsComponent;
