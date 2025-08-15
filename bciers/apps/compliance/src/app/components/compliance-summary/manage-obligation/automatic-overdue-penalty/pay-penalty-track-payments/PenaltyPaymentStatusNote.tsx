import AlertNote from "@bciers/components/form/components/AlertNote";
import TimeIcon from "@bciers/components/icons/TimeIcon";
import Check from "@bciers/components/icons/Check";
import { BC_GOV_YELLOW } from "@bciers/styles";
import { PayPenaltyTrackPaymentsFormData } from "@/compliance/src/app/types";
import { PenaltyStatus } from "@bciers/utils/src/enums";

interface PenaltyPaymentStatusNoteProps {
  formContext: PayPenaltyTrackPaymentsFormData;
}

export const PenaltyPaymentStatusNote = ({
  formContext,
}: PenaltyPaymentStatusNoteProps) => {
  const isPaid =
    Number(formContext.outstanding_amount) === 0 &&
    formContext.penalty_status === PenaltyStatus.PAID;

  if (isPaid) {
    return (
      <AlertNote icon={<Check width={20} height={20} />}>
        Your payment(s) has been received and applied successfully. Your
        automatic administrative penalty has been fully paid.
      </AlertNote>
    );
  }

  return (
    <AlertNote icon={<TimeIcon fill={BC_GOV_YELLOW} width="20" height="20" />}>
      Please pay the outstanding penalty following the Payment Instructions.
      Once your payment(s) is received and applied, the outstanding penalty will
      be updated below.
    </AlertNote>
  );
};
