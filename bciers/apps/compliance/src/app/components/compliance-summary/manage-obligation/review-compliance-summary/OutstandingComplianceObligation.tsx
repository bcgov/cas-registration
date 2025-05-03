import { InfoRow } from "../../InfoRow";
import { TitleRow } from "../../TitleRow";

interface Prop {
  data: any;
}

export const OutstandingComplianceObligation = ({ data }: Prop) => {
  return (
    <div className={`w-full mb-2.5`}>
      <TitleRow label={`Outstanding Compliance Obligation`} />
      <InfoRow
        label="Outstanding Balance:"
        value={`${
          data.outstanding_balance
            ? data.outstanding_balance.toFixed(4)
            : "0.0000"
        } tCO2e`}
      />
      <InfoRow
        label="Equivalent Value:"
        value={`$${data.equivalent_value.toLocaleString(undefined)}`}
        style={{ marginBottom: "50px" }}
      />
    </div>
  );
};
