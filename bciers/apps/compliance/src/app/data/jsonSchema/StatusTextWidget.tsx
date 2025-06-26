import { IssuanceStatus } from "@bciers/utils/src/enums";

const STATUS_TEXTS = {
  AWAITING_APPROVAL: "Issuance requested, awaiting approval",
  APPROVED: "Approved, credits issued in BCCR",
  DECLINED: "Declined, credits not issued in BCCR",
  CHANGES_REQUIRED: "Changes required",
};

export const StatusTextWidget = (props: any) => {
  const { value } = props;

  const statusTextMap = {
    [IssuanceStatus.ISSUANCE_REQUESTED]: STATUS_TEXTS.AWAITING_APPROVAL,
    [IssuanceStatus.AWAITING_APPROVAL]: STATUS_TEXTS.AWAITING_APPROVAL,
    [IssuanceStatus.APPROVED]: STATUS_TEXTS.APPROVED,
    [IssuanceStatus.CREDITS_ISSUED]: STATUS_TEXTS.APPROVED,
    [IssuanceStatus.DECLINED]: STATUS_TEXTS.DECLINED,
    [IssuanceStatus.CREDITS_NOT_ISSUED]: STATUS_TEXTS.DECLINED,
    [IssuanceStatus.CHANGES_REQUIRED]: STATUS_TEXTS.CHANGES_REQUIRED,
  };

  return <span>{statusTextMap[value as keyof typeof statusTextMap]}</span>;
};
