import { RJSFSchema, UiSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import HiddenFieldTemplate from "@bciers/components/form/fields/HiddenFieldTemplate";
import { ReadOnlyWidget } from "@bciers/components/form/widgets/readOnly";
import {
  commonReadOnlyOptions,
  headerUiConfig,
  readOnlyNumberField,
  readOnlyObjectField,
  readOnlyStringField,
  tco2eUiConfig,
} from "@/compliance/src/app/data/jsonSchema/helpers";
import { ApplyComplianceUnitsSuccessAlertNote } from "@/compliance/src/app/components/compliance-summary/manage-obligation/apply-compliance-units/ApplyComplianceUnitsSuccessAlertNote";
import CheckboxWidgetLeft from "@bciers/components/form/widgets/CheckboxWidgetLeft";

// Base schema for initial and confirmation phases
export const applyComplianceUnitsBaseSchema: RJSFSchema = {
  type: "object",
  title: "Apply Compliance Units",
  required: ["bccr_holding_account_id"],
  properties: {
    apply_compliance_units_success_alert_note: readOnlyStringField(),
    bccr_account_header: readOnlyObjectField("Enter account ID"),
    bccr_holding_account_id: {
      type: "string",
      title: "BCCR Holding Account ID:",
    },
    bccr_trading_name: readOnlyStringField("BCCR Trading Name:"),
  },
};

// Confirmation phase schema (extends base with checkbox)
export const applyComplianceUnitsConfirmationSchema: RJSFSchema = {
  ...applyComplianceUnitsBaseSchema,
  required: [
    ...(applyComplianceUnitsBaseSchema.required || []),
    "confirmation_checkbox",
  ],
  properties: {
    ...applyComplianceUnitsBaseSchema.properties,
    confirmation_checkbox: {
      type: "boolean",
      title: "I confirm the accuracy of the information above.",
    },
  },
};

// Compliance data phase schema (extends base with all compliance fields)
export const applyComplianceUnitsDataSchema: RJSFSchema = {
  ...applyComplianceUnitsBaseSchema,
  properties: {
    ...applyComplianceUnitsBaseSchema.properties,
    bccr_compliance_account_id: readOnlyStringField(
      "BCCR Compliance Account ID:",
    ),
    bccr_units: {
      type: "array",
      title: "Indicate compliance units to be applied",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          type: { type: "string" },
          serial_number: { type: "string" },
          vintage_year: { type: "number" },
          quantity_available: { type: "number" },
          quantity_to_be_applied: { type: "number" },
        },
      },
    },
    summary_header: readOnlyStringField("Summary"),
    total_quantity_to_be_applied: {
      ...readOnlyNumberField("Total Quantity to be Applied:"),
      default: 0,
    },
    total_equivalent_emission_reduced: {
      ...readOnlyNumberField("Total Equivalent Emission Reduced:"),
      default: 0,
    },
    total_equivalent_value: {
      ...readOnlyNumberField("Total Equivalent Value:"),
      default: 0,
    },
    outstanding_balance: {
      ...readOnlyNumberField(
        "Outstanding Balance after Applying Compliance Units:",
      ),
      default: 0,
    },
  },
};

export const createApplyComplianceUnitsUiSchema = (
  operationName?: string,
): UiSchema => ({
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  apply_compliance_units_success_alert_note: {
    "ui:widget": ApplyComplianceUnitsSuccessAlertNote,
    "ui:options": {
      label: false,
      inline: true,
    },
  },
  bccr_account_header: headerUiConfig,
  bccr_holding_account_id: {
    "ui:widget": "BccrHoldingAccountWidget",
    "ui:classNames": "[&>div:first-child]:w-1/3", // modify the width of the label
    "ui:options": {
      inline: true,
    },
  },
  bccr_trading_name: {
    "ui:FieldTemplate": HiddenFieldTemplate,
    "ui:widget": ReadOnlyWidget,
  },
  bccr_compliance_account_id: {
    "ui:widget": ReadOnlyWidget,
  },
  bccr_units: {
    "ui:widget": "ApplyComplianceUnitsWidget",
    "ui:classNames":
      // Modify the label width and font weight, and the grid width
      "text-bc-bg-blue mt-8 [&>div:first-child]:mb-2 md:flex-col [&>div:first-child]:w-full [&>div:first-child>label]:font-normal [&>div:last-child]:w-full",
  },
  // Summary Section
  summary_header: headerUiConfig,
  total_quantity_to_be_applied: commonReadOnlyOptions,
  total_equivalent_emission_reduced: tco2eUiConfig,
  total_equivalent_value: {
    ...commonReadOnlyOptions,
    "ui:widget": "ReadOnlyCurrencyWidget",
  },
  outstanding_balance: {
    ...commonReadOnlyOptions,
    "ui:widget": "ReadOnlyCurrencyWidget",
  },
  confirmation_checkbox: {
    "ui:FieldTemplate": FieldTemplate,
    "ui:widget": CheckboxWidgetLeft,
    "ui:help": (
      <small>
        By checking off the box above, you confirm that the B.C. Carbon Registry
        Holding Account was entered accurately and the Trading Name displays
        correctly. Your confirmation will initiate the creation of a compliance
        account for {operationName || "the operation"}.
      </small>
    ),
    "ui:options": {
      label: false,
    },
  },
});
