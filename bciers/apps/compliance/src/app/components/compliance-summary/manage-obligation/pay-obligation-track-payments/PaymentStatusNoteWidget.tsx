import { PaymentStatusNote } from "./PaymentStatusNote";

interface PaymentStatusNoteWidgetProps {
  registry: {
    formContext: {
      outstanding_balance: number;
    };
  };
}

export const PaymentStatusNoteWidget = ({
  registry,
}: PaymentStatusNoteWidgetProps) => {
  return (
    <PaymentStatusNote
      outstandingBalance={registry.formContext?.outstanding_balance}
    />
  );
};
