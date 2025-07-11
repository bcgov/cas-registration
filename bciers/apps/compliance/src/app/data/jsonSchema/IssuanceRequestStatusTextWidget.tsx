import { IssuanceStatus } from "@bciers/utils/src/enums";

const STATUS_TEXTS = {
  ISSUANCE_NOT_REQUESTED: "Issuance not requested",
  ISSUANCE_REQUESTED: "Issuance requested, awaiting approval",
  APPROVED: "Approved, credits issued in BCCR",
  DECLINED: "Declined, credits not issued in BCCR",
  CHANGES_REQUIRED: "Changes required",
};

export const IssuanceRequestStatusTextWidget = (props: any) => {
  const { value } = props;

  const statusTextMap = {
    [IssuanceStatus.ISSUANCE_REQUESTED]: STATUS_TEXTS.ISSUANCE_REQUESTED,
    [IssuanceStatus.APPROVED]: STATUS_TEXTS.APPROVED,
    [IssuanceStatus.DECLINED]: STATUS_TEXTS.DECLINED,
    [IssuanceStatus.CREDITS_NOT_ISSUED]: STATUS_TEXTS.ISSUANCE_NOT_REQUESTED,
    [IssuanceStatus.CHANGES_REQUIRED]: STATUS_TEXTS.CHANGES_REQUIRED,
  };

  return <span>{statusTextMap[value as keyof typeof statusTextMap]}</span>;
};
