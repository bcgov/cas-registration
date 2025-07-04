import { RJSFSchema, UiSchema, WidgetProps } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import {
  commonReadOnlyOptions,
  readOnlyObjectField,
  readOnlyStringField,
  tco2eUiConfig,
  headerUiConfig,
  currencyUiConfig,
} from "@/compliance/src/app/data/jsonSchema/helpers";
import { PaymentStatusNote } from "@/compliance/src/app/components/compliance-summary/manage-obligation/pay-obligation-track-payments/PaymentStatusNote";
import { AutomaticOverduePenaltyNote } from "@/compliance/src/app/components/compliance-summary/manage-obligation/pay-obligation-track-payments/AutomaticOverduePenaltyNote";

interface PayObligationTrackPaymentsFormData {
  outstanding_balance: string;
  fee_amount_dollars: string;
  received_date: string;
  amount: string;
}

const PaymentStatusNoteWidget = ({
  formData,
}: WidgetProps<PayObligationTrackPaymentsFormData>) => {
  const outstanding_balance = parseFloat(formData?.outstanding_balance ?? "0");
  return <PaymentStatusNote outstandingBalance={outstanding_balance} />;
};

export const createPayObligationTrackPaymentsSchema = (): RJSFSchema => ({
  type: "object",
  title: "Pay Obligation and Track Payment(s)",
  properties: {
    // Outstanding Compliance Obligation Section
    outstanding_obligation_header: readOnlyObjectField(
      "Outstanding Compliance Obligation",
    ),
    payment_status_note: readOnlyStringField(),
    outstanding_balance: readOnlyStringField("Outstanding Balance:"),
    fee_amount_dollars: readOnlyStringField("Equivalent Value:"),

    // Payment Section
    payment_header: readOnlyObjectField("Payment 1"),
    received_date: readOnlyStringField("Payment Received Date:"),
    amount: readOnlyStringField("Payment Amount Received:"),

    // Penalty Alert Section
    penalty_alert: readOnlyStringField(),
  },
});

export const payObligationTrackPaymentsUiSchema: UiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",

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
  fee_amount_dollars: currencyUiConfig,

  // Payment Section
  payment_header: headerUiConfig,
  received_date: commonReadOnlyOptions,
  amount: currencyUiConfig,

  // Penalty Alert Section
  penalty_alert: {
    "ui:widget": AutomaticOverduePenaltyNote,
    "ui:options": {
      label: false,
      inline: true,
    },
  },
};
