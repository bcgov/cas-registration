"use client";

import { useState } from "react";
import FormBase from "@bciers/components/form/FormBase";
import {
  requestIssuanceOfEarnedCreditsSchema,
  requestIssuanceOfEarnedCreditsUiSchema,
} from "@/compliance/src/app/data/jsonSchema/requestIssuance/requestIssuanceOfEarnedCreditsSchema";
import ComplianceStepButtons from "@/compliance/src/app/components/ComplianceStepButtons";
import { BccrAccountDetailsResponse } from "@/compliance/src/app/types";

interface Props {
  complianceSummaryId: string;
}

const RequestIssuanceOfEarnedCreditsComponent = ({
  complianceSummaryId,
}: Props) => {
  const backUrl = `/compliance-summaries/${complianceSummaryId}/request-issuance-review-summary`;
  const saveAndContinueUrl = `/compliance-summaries/${complianceSummaryId}/track-status-of-issuance`;

  const [formData, setFormData] = useState<any>({});

  return (
    <FormBase
      schema={requestIssuanceOfEarnedCreditsSchema}
      uiSchema={requestIssuanceOfEarnedCreditsUiSchema}
      formData={formData}
      onChange={(e) => setFormData(e.formData)}
      formContext={{
        onValidAccountResolved: (response?: BccrAccountDetailsResponse) =>
          setFormData((prev: any) => ({
            ...prev,
            bccrTradingName: response?.tradingName ?? undefined,
          })),
      }}
      className="w-full"
    >
      <ComplianceStepButtons
        backUrl={backUrl}
        continueUrl={saveAndContinueUrl}
        submitButtonDisabled={!formData.bccrTradingName}
        continueButtonText="Requests Issuance of Earned Credits"
        className="mt-44"
      />
    </FormBase>
  );
};

export default RequestIssuanceOfEarnedCreditsComponent;
