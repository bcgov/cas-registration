import { ComplianceHeading } from "../../ComplianceHeading";
import ComplianceStepButtons from "@bciers/components/form/components/ComplianceStepButtons";
import { FormReport } from "./FormReport";
import { EarnedCredits } from "./EarnedCredits";

interface Props {
  readonly data: any;
  readonly complianceSummaryId: any;
}

export function RequestIssuanceReviewContent({ data, complianceSummaryId }: Props) {
  const backUrl = `/compliance-summaries`;
  const saveAndContinueUrl = `/compliance-summaries/${complianceSummaryId}/request-issuance/request-issuance-of-earned-credits`;

  return (
    <div className="w-full">
      <ComplianceHeading title="Review 2024 Compliance Summary" />
      <FormReport data={data} />
      <EarnedCredits data={data} />

      <ComplianceStepButtons
        key="form-buttons"
        backUrl={backUrl}
        continueUrl={saveAndContinueUrl}
        backButtonDisabled={false}
        submitButtonDisabled={false}
        style={{ marginTop: "170px" }}
      />
    </div>
  );
}
