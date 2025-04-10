import { InfoRow } from "../InfoRow";
import { TitleRow } from "../TitleRow";

export const ComplianceObligation = ({ data }: any) => {
  return (
    <div className={`w-full mb-2.5`}>
      <TitleRow label={`${data.reporting_year} Compliance Obligation`} />
      <InfoRow label="Obligation ID:" value={`${data.obligation_id}`} />
      <InfoRow
        label={`${data.reporting_year} Compliance Charge Rate:`}
        value={`$${data.compliance_charge_rate.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} / tCO2e`}
      />
      <InfoRow
        label="Equivalent Value:"
        value={`$${data.equivalent_value.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`}
        style={{ marginBottom: "50px" }}
      />
    </div>
  );
};
