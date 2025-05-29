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
    invoiceNumber: readOnlyStringField("Invoice #:"),
    // Payee Info
    payeeHeader: readOnlyObjectField(`Payee Information`),
    bankName: readOnlyStringField("Name of Bank:"),
    bankTransitNumber: readOnlyStringField("Bank Transit Number:"),
    institutionNumber: readOnlyStringField("Institution Number:"),
    swiftCode: readOnlyStringField("Swift Code:"),
    accountNumber: readOnlyStringField("Account Number:"),
    accountName: readOnlyStringField("Account Name:"),
    bankAddress: readOnlyStringField("Bank Address:"),
    // Payment Instructions
    paymentHeader: readOnlyObjectField(`Payment Instructions`),
    beforePayment: readOnlyStringField(),
    // Payment Remarks
    remarksHeader: readOnlyObjectField(`Remarks`),
    remarks: readOnlyStringField(),
  },
});

export const downloadPaymentInstructionsUiSchema: UiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  // Invoice Number
  invoiceNumber: commonReadOnlyOptions,

  // Payee Info
  payeeHeader: headerUiConfig,
  bankName: commonReadOnlyOptions,
  bankTransitNumber: commonReadOnlyOptions,
  institutionNumber: commonReadOnlyOptions,
  swiftCode: commonReadOnlyOptions,
  accountNumber: commonReadOnlyOptions,
  accountName: commonReadOnlyOptions,
  bankAddress: commonReadOnlyOptions,

  // Payment Instructions
  paymentHeader: headerUiConfig,
  beforePayment: {
    "ui:widget": PaymentInstructionsDetails,
    "ui:FieldTemplate": FieldTemplate,
    "ui:options": {
      inline: true,
      label: false,
    },
  },
  remarksHeader: headerUiConfig,
  remarks: {
    "ui:widget": PaymentRemarks,
    "ui:FieldTemplate": FieldTemplate,
    "ui:options": {
      inline: true,
      label: false,
    },
  },
};
