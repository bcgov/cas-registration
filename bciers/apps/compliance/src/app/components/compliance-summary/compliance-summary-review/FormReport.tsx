import { InfoRow } from "./InfoRow";
import { TitleRow } from "./TitleRow";

export const FormReport = ({ data }: any) => {
  return (
    <div className={`w-full mb-2.5`}>
      <TitleRow label={`From ${data.reporting_year} Report`} />
      <InfoRow
        label="Emissions Attributable for Compliance:"
        value={`${data.emissions_attributable_for_compliance} tCO2e`}
      />
      <InfoRow
        label="Emissions Limit:"
        value={`${data.emission_limit} tCO2e`}
      />
      <InfoRow
        label="Excess Emissions:"
        value={`${data.excess_emissions} tCO2e`}
        style={{ marginBottom: "50px" }}
      />
    </div>
  );
};
