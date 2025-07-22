import { RJSFSchema, UiSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import {
  commonReadOnlyOptions,
  readOnlyObjectField,
  readOnlyStringField,
  tco2eUiConfig,
  headerUiConfig,
} from "@/compliance/src/app/data/jsonSchema/helpers";
import { ComplianceUnitsGrid } from "@/compliance/src/app/components/compliance-summary/manage-obligation/review-compliance-summary/ComplianceUnitsGrid";
import { MonetaryPaymentsGrid } from "@/compliance/src/app/components/compliance-summary/manage-obligation/review-compliance-summary/MonetaryPaymentsGrid";

export const createComplianceSummaryReviewSchema = (
  reportingYear: number,
): RJSFSchema => ({
  type: "object",
  title: `Review ${reportingYear} Compliance Summary`,
  properties: {
    // Summary Section
    summary_header: readOnlyObjectField(`From ${reportingYear} Report`),
    emissions_attributable_for_compliance: readOnlyStringField(
      "Emissions Attributable for Compliance:",
    ),
    emissions_limit: readOnlyStringField("Emissions Limit:"),
    excess_emissions: readOnlyStringField("Excess Emissions:"),
    // Obligation Section
    obligation_header: readOnlyObjectField(
      `${reportingYear} Compliance Obligation`,
    ),
    obligation_id: readOnlyStringField("Obligation ID:"),
    compliance_charge_rate: readOnlyStringField(
      `${reportingYear} Compliance Charge Rate:`,
    ),
    equivalent_value: readOnlyStringField("Equivalent Value:"),
    // Compliance Units Section
    applied_units_summary: readOnlyStringField(),
    // Monetary Payments Section
    monetary_payments: readOnlyStringField(),
    // Outstanding Compliance Obligation Section
    outstanding_obligation_header: readOnlyObjectField(
      "Outstanding Compliance Obligation",
    ),
    outstanding_balance_tco2e: readOnlyStringField("Outstanding Balance:"),
    outstanding_balance_equivalent_value:
      readOnlyStringField("Equivalent Value:"),
  },
});

export const complianceSummaryReviewUiSchema: UiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",

  // Summary Section
  summary_header: headerUiConfig,
  emissions_attributable_for_compliance: tco2eUiConfig,
  emissions_limit: tco2eUiConfig,
  excess_emissions: tco2eUiConfig,

  // Obligation Section
  obligation_header: headerUiConfig,
  obligation_id: commonReadOnlyOptions,
  compliance_charge_rate: {
    ...commonReadOnlyOptions,
    "ui:options": {
      prefix: "$",
      suffix: "/tCO2e",
    },
  },
  equivalent_value: {
    ...commonReadOnlyOptions,
    "ui:widget": "ReadOnlyCurrencyWidget",
  },
  applied_units_summary: {
    "ui:widget": ComplianceUnitsGrid,
    "ui:classNames": "text-bc-bg-blue mt-8 [&>label]:mb-2",
    "ui:FieldTemplate": FieldTemplate,
    "ui:options": {
      label: false,
      inline: true,
    },
  },
  monetary_payments: {
    "ui:widget": MonetaryPaymentsGrid,
    "ui:classNames": "text-bc-bg-blue mt-8 [&>label]:mb-2",
    "ui:FieldTemplate": FieldTemplate,
    "ui:options": {
      label: false,
      inline: true,
    },
  },

  // Outstanding Compliance Obligation Section
  outstanding_obligation_header: headerUiConfig,
  outstanding_balance_tco2e: tco2eUiConfig,
  outstanding_balance_equivalent_value: {
    ...commonReadOnlyOptions,
    "ui:widget": "ReadOnlyCurrencyWidget",
  },
};
