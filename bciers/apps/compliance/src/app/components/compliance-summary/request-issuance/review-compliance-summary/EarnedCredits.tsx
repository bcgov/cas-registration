import { InfoRow } from "../../InfoRow";
import { TitleRow } from "../../TitleRow";
import { EarnedCreditsAlertNote } from "./EarnedCreditsAlertNote";

export const EarnedCredits = ({ data }: any) => {
  return (
    <div className={`w-full mb-2.5`}>
      <TitleRow label={`Earned Credits`} />

      <EarnedCreditsAlertNote />

      <InfoRow label="Earned Credits:" value={data.earned_credits} />
      <InfoRow
        label="Status of Issuance:"
        value={data.issuance_status}
        style={{ marginBottom: "50px" }}
      />
    </div>
  );
};
