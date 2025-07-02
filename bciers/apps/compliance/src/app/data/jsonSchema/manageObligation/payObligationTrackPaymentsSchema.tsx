import { RJSFSchema, UiSchema, WidgetProps } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import {
  commonReadOnlyOptions,
  readOnlyObjectField,
  readOnlyStringField,
  tco2eUiConfig,
  headerUiConfig,
} from "@/compliance/src/app/data/jsonSchema/helpers";
import { PaymentStatusNote } from "../../../components/compliance-summary/manage-obligation/pay-obligation-track-payments/PaymentStatusNote";
import { AutomaticOverduePenaltyNote } from "../../../components/compliance-summary/manage-obligation/pay-obligation-track-payments/AutomaticOverduePenaltyNote";

interface PayObligationTrackPaymentsFormData {
  outstandingBalance: string;
  equivalentValue: string;
  paymentReceivedDate: string;
  paymentAmountReceived: string;
}

const PaymentStatusNoteWidget = ({
  formData,
}: WidgetProps<PayObligationTrackPaymentsFormData>) => {
  const outstandingBalance = parseFloat(formData?.outstandingBalance ?? "0");
  return <PaymentStatusNote outstandingBalance={outstandingBalance} />;
};

export const createPayObligationTrackPaymentsSchema = (): RJSFSchema => ({
  type: "object",
  title: "Pay Obligation and Track Payment(s)",
  properties: {
    // Outstanding Compliance Obligation Section
    outstandingObligationHeader: readOnlyObjectField(
      "Outstanding Compliance Obligation",
    ),
    paymentStatusNote: readOnlyStringField(),
    outstandingBalance: readOnlyStringField("Outstanding Balance:"),
    equivalentValue: readOnlyStringField("Equivalent Value:"),

    // Payment Section
    paymentHeader: readOnlyObjectField("Payment 1"),
    paymentReceivedDate: readOnlyStringField("Payment Received Date:"),
    paymentAmountReceived: readOnlyStringField("Payment Amount Received:"),

    // Penalty Alert Section
    penaltyAlert: readOnlyStringField(),
  },
});

export const payObligationTrackPaymentsUiSchema: UiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",

  // Outstanding Compliance Obligation Section
  outstandingObligationHeader: headerUiConfig,
  paymentStatusNote: {
    "ui:widget": PaymentStatusNoteWidget,
    "ui:options": {
      label: false,
      inline: true,
    },
  },
  outstandingBalance: tco2eUiConfig,
  equivalentValue: {
    "ui:widget": "ReadOnlyCurrencyWidget",
  },

  // Payment Section
  paymentHeader: headerUiConfig,
  paymentReceivedDate: commonReadOnlyOptions,
  paymentAmountReceived: {
    "ui:widget": "ReadOnlyCurrencyWidget",
  },

  // Penalty Alert Section
  penaltyAlert: {
    "ui:widget": AutomaticOverduePenaltyNote,
    "ui:options": {
      label: false,
      inline: true,
    },
  },
};
