import { InfoRow } from "../../InfoRow";
import { TitleRow } from "../../TitleRow";
import { formatMonetaryValue } from "@/compliance/src/app/utils/formatting";

export const ComplianceObligation = ({ data }: any) => {
  return (
    <div className={`w-full mb-2.5`}>
      <TitleRow label={`${data.reporting_year} Compliance Obligation`} />
      <InfoRow label="Obligation ID:" value={`${data.obligation_id}`} />
      <InfoRow
        label={`${data.reporting_year} Compliance Charge Rate:`}
        value={`${formatMonetaryValue(data.compliance_charge_rate)} / tCO2e`}
      />
      <InfoRow
        label="Equivalent Value:"
        value={formatMonetaryValue(data.equivalent_value)}
        style={{ marginBottom: "50px" }}
      />
    </div>
  );
};
