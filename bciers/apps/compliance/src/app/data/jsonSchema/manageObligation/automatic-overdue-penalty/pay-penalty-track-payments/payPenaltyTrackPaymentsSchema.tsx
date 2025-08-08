import { RJSFSchema, UiSchema } from "@rjsf/utils";
import { FieldTemplate } from "@bciers/components/form/fields";
import {
  commonReadOnlyOptions,
  readOnlyObjectField,
  readOnlyStringField,
  readOnlyNumberField,
  headerUiConfig,
} from "@/compliance/src/app/data/jsonSchema/helpers";
import { WidgetProps } from "@rjsf/utils";
import { PenaltyPaymentStatusNote } from "@/compliance/src/app/components/compliance-summary/manage-obligation/automatic-overdue-penalty/pay-penalty-track-payments/PenaltyPaymentStatusNote";

// Custom widget for payment headers
const PaymentHeaderWidget = (props: WidgetProps) => {
  const { id } = props;
  // Extract index from field id like "root_payments_0_payment_header"
  const indexMatch = id?.match(/root_payments_(\d+)_payment_header/);
  const paymentIndex = indexMatch ? parseInt(indexMatch[1], 10) : 0;

  return <span>{`Payment ${paymentIndex + 1}`}</span>;
};

export const createPayPenaltyTrackPaymentsSchema = (): RJSFSchema => ({
  type: "object",
  title: "Pay Penalty and Track Payment(s)",
  properties: {
    // Outstanding Penalty Section
    outstanding_penalty_header: readOnlyObjectField("Outstanding Penalty"),
    payment_status_note: readOnlyStringField(),
    outstanding_amount: readOnlyNumberField("Outstanding Amount:"),

    // Payments Section
    payments: {
      type: "array",
      items: {
        type: "object",
        properties: {
          payment_header: readOnlyStringField(),
          received_date: readOnlyStringField("Payment Received Date:"),
          amount: readOnlyNumberField("Payment Amount Received:"),
        },
      },
    },
  },
});

export const payPenaltyTrackPaymentsUiSchema: UiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",

  // Outstanding Penalty Section
  outstanding_penalty_header: headerUiConfig,
  payment_status_note: {
    "ui:widget": PenaltyPaymentStatusNote,
    "ui:options": {
      label: false,
      inline: true,
    },
  },
  outstanding_amount: {
    ...commonReadOnlyOptions,
    "ui:widget": "ReadOnlyCurrencyWidget",
  },

  // Payments Section
  payments: {
    "ui:FieldTemplate": FieldTemplate,
    "ui:options": {
      orderable: false,
      addable: false,
      removable: false,
      label: false,
    },
    items: {
      payment_header: {
        "ui:widget": PaymentHeaderWidget,
        "ui:classNames": "text-bc-bg-blue mt-4",
        "ui:options": {
          label: false,
        },
      },
      received_date: {
        ...commonReadOnlyOptions,
        "ui:widget": "ReadOnlyDateWidget",
      },
      amount: {
        ...commonReadOnlyOptions,
        "ui:widget": "ReadOnlyCurrencyWidget",
      },
    },
  },
};
