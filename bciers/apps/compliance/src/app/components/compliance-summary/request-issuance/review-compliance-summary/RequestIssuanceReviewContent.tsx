import { ComplianceHeading } from "../../ComplianceHeading";
import ComplianceStepButtons from "@bciers/components/form/components/ComplianceStepButtons";
import { FormReport } from "./FormReport";
import { EarnedCredits } from "./EarnedCredits";

interface Props {
  readonly continueUrl: string;
  readonly backUrl?: string;
  readonly data: any;
}

export function RequestIssuanceReviewContent(props: Props) {
  const { backUrl, continueUrl, data } = props;

  return (
    <div className="w-full">
      <ComplianceHeading title="Review 2024 Compliance Summary" />
      <FormReport data={data} />
      <EarnedCredits data={data} />

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
