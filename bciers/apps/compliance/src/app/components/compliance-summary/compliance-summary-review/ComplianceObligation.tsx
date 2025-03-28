import { InfoRow } from "./InfoRow";
import { TitleRow } from "./TitleRow";

export const ComplianceObligation = ({ data }: any) => {
  return (
    <div className={`w-full mb-2.5`}>
      <TitleRow label={`${data.reporting_year} Compliance Obligation`} />
      <InfoRow label="Obligation ID:" value={`${data.obligation_id} tCO2e`} />
      <InfoRow
        label={`${data.reporting_year} Compliance Charge Rate:`}
        value={`${data.compliance_change_rate} tCO2e`}
      />
      <InfoRow
        label="Equivalent Value:"
        value={`${data.excess_emissions * data.compliance_change_rate} tCO2e`}
        style={{ marginBottom: "50px" }}
      />
    </div>
  );
};
