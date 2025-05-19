import { ComplianceHeading } from "../../ComplianceHeading";
import ComplianceStepButtons from "@bciers/components/form/components/ComplianceStepButtons";
import { StatusOfIssuance } from "./StatusOfIssuance";
import { RequestIssuanceTrackStatusData } from "@/compliance/src/app/utils/getRequestIssuanceTrackStatusData";

interface Props {
  backUrl?: string;
  data: RequestIssuanceTrackStatusData;
  complianceSummaryId?: number;
}

export function TrackStatusOfIssuanceContent(props: Props) {
  const { backUrl, data } = props;

  return (
    <div className="w-full">
      <ComplianceHeading title="Track Status of Issuance" />
      <StatusOfIssuance data={data} />
      <ComplianceStepButtons
        key="form-buttons"
        backUrl={backUrl}
        backButtonDisabled={false}
        submitButtonDisabled={false}
        style={{ marginTop: "170px" }}
      />
    </div>
  );
}
