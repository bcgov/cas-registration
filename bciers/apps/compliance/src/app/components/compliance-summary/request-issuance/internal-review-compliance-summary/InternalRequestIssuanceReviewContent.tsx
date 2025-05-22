import { ComplianceHeading } from "@/compliance/src/app/components/compliance-summary/ComplianceHeading";
import ComplianceStepButtons from "@bciers/components/form/components/ComplianceStepButtons";
import { FormReport } from "@/compliance/src/app/components/compliance-summary/request-issuance/review-compliance-summary/FormReport";
import { EarnedCredits } from "@/compliance/src/app/components/compliance-summary/request-issuance/review-compliance-summary/EarnedCredits";

interface Props {
  readonly continueUrl: string;
  readonly backUrl?: string;
  readonly data: any;
}

export function InternalRequestIssuanceReviewContent(props: Props) {
  const { backUrl, continueUrl, data } = props;

  return (
    <div className="w-full">
      <ComplianceHeading title="Review 2024 Compliance Summary" />
      <FormReport data={data} />
      <EarnedCredits data={data} isCasStaff={true} />

      <ComplianceStepButtons
        key="form-buttons"
        backUrl={backUrl}
        continueUrl={continueUrl}
        backButtonDisabled={false}
        submitButtonDisabled={false}
        style={{ marginTop: "170px" }}
      />
    </div>
  );
}
