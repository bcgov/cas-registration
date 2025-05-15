import { InfoRow } from "../../InfoRow";
import { TitleRow } from "../../TitleRow";
import { EarnedCreditsAlertNote } from "./EarnedCreditsAlertNote";

interface EarnedCreditsProps {
  data: any;
  isCasStaff: boolean;
}

export const EarnedCredits = ({ data, isCasStaff }: EarnedCreditsProps) => {
  return (
    <div className={`w-full mb-2.5`}>
      <TitleRow label={`Earned Credits`} />

      {!isCasStaff && <EarnedCreditsAlertNote />}

      <InfoRow label="Earned Credits:" value={data.earned_credits} />
      <InfoRow
        label="Status of Issuance:"
        value={data.issuance_status}
        style={{ marginBottom: "50px" }}
      />
    </div>
  );
};
