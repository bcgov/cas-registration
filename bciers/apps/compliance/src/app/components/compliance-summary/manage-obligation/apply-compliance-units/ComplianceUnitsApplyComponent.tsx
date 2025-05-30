"use client";

import ComplianceStepButtons from "@/compliance/src/app/components/ComplianceStepButtons";
import { FormBase } from "@bciers/components/form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  complianceUnitsApplySchema,
  complianceUnitsApplyUiSchema,
} from "@/compliance/src/app/data/jsonSchema/manageObligation/complianceUnitsApplySchema";
import { BccrAccountDetailsResponse } from "@/compliance/src/app/types";

interface Props {
  complianceSummaryId: any;
}

export default function ComplianceUnitsApplyComponent({
  complianceSummaryId,
}: Readonly<Props>) {
  const router = useRouter();
  const [formData, setFormData] = useState<any>({});

  const backUrl = `/compliance-summaries/${complianceSummaryId}/manage-obligation-review-summary`;
  const saveAndContinueUrl = `/compliance-summaries/${complianceSummaryId}/download-payment-instructions`;

  return (
    <FormBase
      schema={complianceUnitsApplySchema}
      uiSchema={complianceUnitsApplyUiSchema}
      formData={formData}
      onChange={(e) => setFormData(e.formData)}
      formContext={{
        onValidAccountResolved: (response?: BccrAccountDetailsResponse) =>
          setFormData((prev: any) => ({
            ...prev,
            bccrTradingName: response?.tradingName ?? undefined,
            // TODO: Implement logic to handle complianceAccountId
            // bccrComplianceAccountId: response?.complianceAccountId ?? undefined,
          })),
      }}
      className="w-full"
    >
      <ComplianceStepButtons
        backButtonText="Cancel"
        continueButtonText="Apply"
        onBackClick={() => router.push(backUrl)}
        onContinueClick={() => router.push(saveAndContinueUrl)}
        middleButtonDisabled={false}
        className="mt-44"
        // TODO: implement validation logic
        submitButtonDisabled={true}
      />
    </FormBase>
  );
}
