import { RJSFSchema, UiSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import {
  readOnlyObjectField,
  readOnlyStringField,
  readOnlyNumberField,
  tco2eUiConfig,
  headerUiConfig,
} from "@/compliance/src/app/data/jsonSchema/helpers";
import { PaymentStatusNoteWidget } from "../../../components/compliance-summary/manage-obligation/pay-obligation-track-payments/PaymentStatusNoteWidget";
import { AutomaticOverduePenaltyNote } from "../../../components/compliance-summary/manage-obligation/pay-obligation-track-payments/AutomaticOverduePenaltyNote";
import { WidgetProps } from "@rjsf/utils";

// Custom widget for payment headers
const PaymentHeaderWidget = (props: WidgetProps) => {
  const { id } = props;
  // Extract index from field id like "root_payments_0_payment_header"
  const indexMatch = id?.match(/root_payments_(\d+)_payment_header/);
  const paymentIndex = indexMatch ? parseInt(indexMatch[1], 10) : 0;

  return <span>{`Payment ${paymentIndex + 1}`}</span>;
};

export const createPayObligationTrackPaymentsSchema = (): RJSFSchema => ({
  type: "object",
  title: "Pay Obligation and Track Payment(s)",
  properties: {
    // This will be used internally but hidden from the UI
    penalty_status: {
      type: "string",
      enum: ["NONE", "ACCRUING", "PAID"],
    },

    // Outstanding Compliance Obligation Section
    outstanding_obligation_header: readOnlyObjectField(
      "Outstanding Compliance Obligation",
    ),
    payment_status_note: readOnlyStringField(),
    outstanding_balance: readOnlyNumberField("Outstanding Balance:"),
    equivalent_value: readOnlyNumberField("Equivalent Value:"),

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

  allOf: [
    {
      if: {
        properties: {
          penalty_status: { const: "ACCRUING" },
        },
        required: ["penalty_status"],
      },
      then: {
        properties: {
          penalty_alert: readOnlyStringField(),
        },
        required: ["penalty_alert"],
      },
    },
  ],
});

export const payObligationTrackPaymentsUiSchema: UiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  penalty_status: {
    "ui:widget": "hidden",
  },
  // Outstanding Compliance Obligation Section
  outstanding_obligation_header: headerUiConfig,
  payment_status_note: {
    "ui:widget": PaymentStatusNoteWidget,
    "ui:options": {
      label: false,
      inline: true,
    },
  },
  outstanding_balance: tco2eUiConfig,
  equivalent_value: {
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
        "ui:widget": "ReadOnlyDateWidget",
      },
      amount: {
        "ui:widget": "ReadOnlyCurrencyWidget",
      },
    },
  },

  // Penalty Alert Section
  penalty_alert: {
    "ui:widget": AutomaticOverduePenaltyNote,
    "ui:options": {
      label: false,
      inline: true,
    },
  },
};
