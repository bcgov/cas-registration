import { WidgetProps } from "@rjsf/utils";
import { PaymentStatusNote } from "./PaymentStatusNote";

interface PaymentStatusNoteWidgetProps extends WidgetProps {
  outstandingBalance: number;
}

export const PaymentStatusNoteWidget = (
  props: PaymentStatusNoteWidgetProps,
) => {
  return (
    <PaymentStatusNote
      outstandingBalance={props.formContext?.outstanding_balance}
    />
  );
};
