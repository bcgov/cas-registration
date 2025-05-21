import { InfoRow } from "../../InfoRow";
import { TitleRow } from "../../TitleRow";

interface Props {
  data: any; // TODO: Define a proper type for the data
}

export const FormReport = ({ data }: Props) => {
  return (
    <div className={`w-full mb-2.5`}>
      <TitleRow label={`From ${data.reportingYear} Report`} />
      <InfoRow
        label="Emissions Attributable for Compliance:"
        value={`${data.emissionsAttributableForCompliance} tCO2e`}
      />
      <InfoRow
        label="Emissions Limit:"
        value={`${data.emissionLimit} tCO2e`}
      />
      <InfoRow
        label="Excess Emissions:"
        value={`${data.excessEmissions} tCO2e`}
        classNames="mb-16"
      />
    </div>
  );
};
