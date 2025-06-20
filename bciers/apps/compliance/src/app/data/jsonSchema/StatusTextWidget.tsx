import { IssuanceStatus } from "@bciers/utils/src/enums";

export const StatusTextWidget = (props: any) => {
  const { value } = props;

  const statusTextMap = {
    [IssuanceStatus.AWAITING]: "Issuance requested, awaiting approval",
    [IssuanceStatus.APPROVED]: "Approved, credits issued in BCCR",
  };

  return <span>{statusTextMap[value as keyof typeof statusTextMap]}</span>;
};
