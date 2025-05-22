import { ComplianceHeading } from "../../ComplianceHeading";
import ComplianceStepButtons from "@bciers/components/form/components/ComplianceStepButtons";
import CarbonRegistryAccountInfo from "./CarbonRegistryAccountInfo";

interface Props {
  readonly continueUrl: string;
  readonly backUrl?: string;
}

export function RequestIssuanceOfEarnedCreditsContent(props: Props) {
  const { backUrl, continueUrl } = props;

  return (
    <div className="w-full">
      <ComplianceHeading title="Request Issuance of Earned Credits" />

      <CarbonRegistryAccountInfo />

      <ComplianceStepButtons
        key="form-buttons"
        backUrl={backUrl}
        continueUrl={continueUrl}
        continueButtonText="Requests Issuance of Earned Credits"
        backButtonDisabled={false}
        submitButtonDisabled={false}
        style={{ marginTop: "170px" }}
      />
    </div>
  );
}
