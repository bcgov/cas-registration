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
import { InterestPaymentStatusNote } from "@/compliance/src/app/components/compliance-summary/manage-obligation/ggeapar-interest/pay-interest-penalty-track-payments/InterestPaymentStatusNote";

// Custom widget for payment headers
const PaymentHeaderWidget = (props: WidgetProps) => {
  const { id } = props;
  // Extract index from field id like "root_payments_0_payment_header"
  const indexMatch = id?.match(/root_payments_(\d+)_payment_header/);
  const paymentIndex = indexMatch ? parseInt(indexMatch[1], 10) : 0;

  return <span>{`Payment ${paymentIndex + 1}`}</span>;
};

export const createPayInterestPenaltyTrackPaymentsSchema = (): RJSFSchema => ({
  type: "object",
  title: "Pay Interest and Track Payment(s)",
  properties: {
    // Outstanding Interest Section
    outstanding_interest_header: readOnlyObjectField("Outstanding Interest"),
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

export const payInterestPenaltyTrackPaymentsUiSchema: UiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",

  // Outstanding Interest Section
  outstanding_interest_header: headerUiConfig,
  payment_status_note: {
    "ui:widget": InterestPaymentStatusNote,
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
