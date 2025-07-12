import { RJSFSchema, UiSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import {
  commonReadOnlyOptions,
  readOnlyObjectField,
  readOnlyStringField,
  headerUiConfig,
} from "@/compliance/src/app/data/jsonSchema/helpers";
import {
  PaymentInstructionsDetails,
  PaymentRemarks,
} from "../../../components/compliance-summary/manage-obligation/download-payment-instructions/PaymentInstructionsDownloadSections";
export const createDownloadPaymentInstructionsSchema = (): RJSFSchema => ({
  type: "object",
  title: `Download Payment Instructions`,
  properties: {
    // Invoice Number
    invoice_number: readOnlyStringField("Invoice #:"),
    // Payee Info
    payee_header: readOnlyObjectField(`Payee Information`),
    bank_name: readOnlyStringField("Name of Bank:"),
    bank_transit_number: readOnlyStringField("Bank Transit Number:"),
    institution_number: readOnlyStringField("Institution Number:"),
    swift_code: readOnlyStringField("Swift Code:"),
    account_number: readOnlyStringField("Account Number:"),
    account_name: readOnlyStringField("Account Name:"),
    bank_address: readOnlyStringField("Bank Address:"),
    // Payment Instructions
    payment_header: readOnlyObjectField(`Payment Instructions`),
    before_payment: readOnlyStringField(),
    // Payment Remarks
    remarks_header: readOnlyObjectField(`Remarks`),
    remarks: readOnlyStringField(),
  },
});

export const downloadPaymentInstructionsUiSchema: UiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  // Invoice Number
  invoice_number: commonReadOnlyOptions,

  // Payee Info
  payee_header: headerUiConfig,
  bank_name: commonReadOnlyOptions,
  bank_transit_number: commonReadOnlyOptions,
  institution_number: commonReadOnlyOptions,
  swift_code: commonReadOnlyOptions,
  account_number: commonReadOnlyOptions,
  account_name: commonReadOnlyOptions,
  bank_address: commonReadOnlyOptions,

  // Payment Instructions
  payment_header: headerUiConfig,
  before_payment: {
    "ui:widget": PaymentInstructionsDetails,
    "ui:FieldTemplate": FieldTemplate,
    "ui:options": {
      inline: true,
      label: false,
    },
  },
  remarks_header: headerUiConfig,
  remarks: {
    "ui:widget": PaymentRemarks,
    "ui:FieldTemplate": FieldTemplate,
    "ui:options": {
      inline: true,
      label: false,
    },
  },
};
