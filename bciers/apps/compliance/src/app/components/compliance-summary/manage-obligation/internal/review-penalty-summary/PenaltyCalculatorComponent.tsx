"use client";

import ComplianceStepButtons from "@/compliance/src/app/components/ComplianceStepButtons";
import { FormBase } from "@bciers/components/form";
import {
  createPenaltyCalculatorSchema,
  penaltyCalculatorUiSchema,
} from "@/compliance/src/app/data/jsonSchema/manageObligation/internal/PenaltyCalculatorSchema";

const penaltyCalculatorSchema = createPenaltyCalculatorSchema();

interface Props {
  complianceReportVersionId: number;
}

export default function PenaltyCalculatorComponent({
  complianceReportVersionId,
}: Readonly<Props>) {
  const backUrl = `/compliance-administration/compliance-summaries/${complianceReportVersionId}/review-penalty-summary`;

  return (
    <FormBase
      schema={penaltyCalculatorSchema}
      uiSchema={penaltyCalculatorUiSchema}
      formData={{ penalty_type: "automatic_overdue" }}
      className="w-full"
    >
      <ComplianceStepButtons backUrl={backUrl} />
    </FormBase>
  );
}
