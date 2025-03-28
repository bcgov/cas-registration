import { InfoRow } from "./InfoRow";
import { TitleRow } from "./TitleRow";

interface Prop {
  data: any;
}

export const OutstandingComplianceObligation = ({ data }: Prop) => {
  return (
    <div className={`w-full mb-2.5`}>
      <TitleRow label={`Outstanding Compliance Obligation`} />
      <InfoRow
        label="Outstanding Balance:"
        value={`${data.outstanding_balance} tCO2e`}
      />
      <InfoRow
        label="Equivalent Value:"
        value={`${data.excess_emissions * data.compliance_change_rate} tCO2e`}
        style={{ marginBottom: "50px" }}
      />
    </div>
  );
};
