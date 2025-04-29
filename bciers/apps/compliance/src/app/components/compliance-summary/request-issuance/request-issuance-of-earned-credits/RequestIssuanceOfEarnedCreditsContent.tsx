import { ComplianceHeading } from "../../ComplianceHeading";
import ComplianceStepButtons from "@bciers/components/form/components/ComplianceStepButtons";
import CarbonRegistryAccountInfo from "./CarbonRegistryAccountInfo";
import { RequestIssuanceData } from "../../../../utils/getRequestIssuanceData";

interface Props {
  readonly continueUrl: string;
  readonly backUrl?: string;
  readonly data: RequestIssuanceData;
}

export function RequestIssuanceOfEarnedCreditsContent(props: Props) {
  const { backUrl, continueUrl, data } = props;

  return (
    <div className="w-full">
      <ComplianceHeading title="Request Issuance of Earned Credits" />

      <CarbonRegistryAccountInfo data={data} />

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
