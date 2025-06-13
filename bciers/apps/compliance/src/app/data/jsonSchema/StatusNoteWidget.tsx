import { IssuanceStatus } from "@bciers/utils/src/enums";
import { IssuanceStatusApprovedNote } from "@/compliance/src/app/components/compliance-summary/request-issuance/track-status-of-issuance/IssuanceStatusApprovedNote";
import { IssuanceStatusAwaitingNote } from "@/compliance/src/app/components/compliance-summary/request-issuance/track-status-of-issuance/IssuanceStatusAwaitingNote";

export const StatusNoteWidget = (props: any) => {
  const { value } = props;

  if (value === IssuanceStatus.AWAITING) {
    return <IssuanceStatusAwaitingNote />;
  }

  if (value === IssuanceStatus.APPROVED) {
    return <IssuanceStatusApprovedNote />;
  }

  return null;
};
