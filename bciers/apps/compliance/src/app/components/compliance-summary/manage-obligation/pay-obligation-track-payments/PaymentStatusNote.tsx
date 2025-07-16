import AlertNote from "@bciers/components/form/components/AlertNote";
import TimeIcon from "@bciers/components/icons/TimeIcon";
import Check from "@bciers/components/icons/Check";
import { BC_GOV_YELLOW } from "@bciers/styles";

interface PaymentStatusNoteProps {
  outstandingBalance: number;
}

export const PaymentStatusNote = ({
  outstandingBalance,
}: PaymentStatusNoteProps) => {
  const isPaid = Number(outstandingBalance) === 0;

  if (isPaid) {
    return (
      <AlertNote icon={<Check width={20} height={20} />}>
        Your payments have been received and applied successfully. Your
        compliance obligation has been fully met.
      </AlertNote>
    );
  }

  return (
    <AlertNote icon={<TimeIcon fill={BC_GOV_YELLOW} width="20" height="20" />}>
      Please pay the outstanding compliance obligation following the payment
      instructions. Once your payment(s) are received and applied, the
      outstanding compliance obligation balance will be updated below.
    </AlertNote>
  );
};
