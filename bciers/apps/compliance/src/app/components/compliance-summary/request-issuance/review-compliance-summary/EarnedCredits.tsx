import { InfoRow } from "../../InfoRow";
import { TitleRow } from "../../TitleRow";
import { EarnedCreditsAlertNote } from "./EarnedCreditsAlertNote";

interface Props {
  data: any; // TODO: Define a proper type for the data
}

export const EarnedCredits = ({ data }: Props) => {
  return (
    <div className={`w-full mt-16`}>
      <TitleRow label={`Earned Credits`} />

      <EarnedCreditsAlertNote />

      <InfoRow label="Earned Credits:" value={data.earnedCredits} />
      <InfoRow
        label="Status of Issuance:"
        value={data.issuanceStatus}
        style={{ marginBottom: "50px" }}
      />
    </div>
  );
};
