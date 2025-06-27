import { RJSFSchema, UiSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import {
  commonReadOnlyOptions,
  readOnlyObjectField,
  readOnlyStringField,
  tco2eUiConfig,
  headerUiConfig,
  currencyUiConfig,
} from "@/compliance/src/app/data/jsonSchema/helpers";
import { ComplianceUnitsGrid } from "@/compliance/src/app/components/compliance-summary/manage-obligation/review-compliance-summary/ComplianceUnitsGrid";
import { AutomaticOverduePenaltyAlertNote } from "@/compliance/src/app/components/compliance-summary/manage-obligation/review-compliance-summary/AutomaticOverduePenaltyAlertNote";
import { MonetaryPaymentsGrid } from "@/compliance/src/app/components/compliance-summary/manage-obligation/review-compliance-summary/MonetaryPaymentsGrid";

export const createComplianceSummaryReviewSchema = (
  reporting_year: number,
): RJSFSchema => ({
  type: "object",
  title: `Review ${reporting_year} Compliance Summary`,
  properties: {
    // Summary Section
<<<<<<< HEAD
    summary_header: readOnlyObjectField(`From ${reportingYear} Report`),
=======
    summary_header: readOnlyObjectField(`From ${reporting_year} Report`),
>>>>>>> 9a5fa2ba9 (chore: update schema field names as model names)
    emissions_attributable_for_compliance: readOnlyStringField(
      "Emissions Attributable for Compliance:",
    ),
    emission_limit: readOnlyStringField("Emissions Limit:"),
    excess_emissions: readOnlyStringField("Excess Emissions:"),
    // Obligation Section
    obligation_header: readOnlyObjectField(
<<<<<<< HEAD
      `${reportingYear} Compliance Obligation`,
    ),
    obligation_id: readOnlyStringField("Obligation ID:"),
    compliance_charge_rate: readOnlyStringField(
      `${reportingYear} Compliance Charge Rate:`,
    ),
    equivalent_value: readOnlyStringField("Equivalent Value:"),
    // Compliance Units Section
    applied_compliance_units: readOnlyStringField(),
    // Monetary Payments Section
    monetary_payments: readOnlyStringField(),
=======
      `${reporting_year} Compliance Obligation`,
    ),
    obligation_id: readOnlyStringField("Obligation ID:"),
    compliance_charge_rate: readOnlyStringField(
      `${reporting_year} Compliance Charge Rate:`,
    ),
    equivalent_value: readOnlyStringField("Equivalent Value:"),
    // Compliance Units Section
    compliance_units: readOnlyStringField("Compliance Units Applied"),
    // Monetary Payments Section
    monetary_payments: readOnlyStringField("Monetary Payments Made"),
>>>>>>> 9a5fa2ba9 (chore: update schema field names as model names)
    // Outstanding Compliance Obligation Section
    outstanding_obligation_header: readOnlyObjectField(
      "Outstanding Compliance Obligation",
    ),
    outstanding_balance: readOnlyStringField("Outstanding Balance:"),
    outstanding_balance_equivalent_value:
      readOnlyStringField("Equivalent Value:"),
    // Penalty Section
    penalty_header: readOnlyObjectField(
      "Automatic Overdue Penalty (as of Today):",
    ),
    penalty_alert: readOnlyStringField(),
    penalty_status: readOnlyStringField("Penalty Status:"),
    penalty_type: readOnlyStringField("Penalty Type:"),
<<<<<<< HEAD
    penalty_charge_rate: readOnlyStringField("Penalty Rate (Daily):"),
=======
    penalty_rate_daily: readOnlyStringField("Penalty Rate (Daily):"),
>>>>>>> 9a5fa2ba9 (chore: update schema field names as model names)
    days_late: readOnlyStringField("Days Late:"),
    accumulated_penalty: readOnlyStringField("Accumulated Penalty:"),
    accumulated_compounding: readOnlyStringField("Accumulated Compounding:"),
    penalty_today: readOnlyStringField("Penalty (as of Today):"),
    faa_interest: readOnlyStringField("FAA Interest (as of Today):"),
    total_amount: readOnlyStringField("Total Amount (as of Today):"),
  },
});

export const complianceSummaryReviewUiSchema: UiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",

  // Summary Section
  summary_header: headerUiConfig,
  emissions_attributable_for_compliance: tco2eUiConfig,
  emission_limit: tco2eUiConfig,
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
    "ui:options": {
      prefix: "$",
    },
  },
<<<<<<< HEAD
  applied_compliance_units: {
=======
  compliance_units: {
>>>>>>> 9a5fa2ba9 (chore: update schema field names as model names)
    "ui:widget": ComplianceUnitsGrid,
    "ui:classNames": "text-bc-bg-blue mt-8 [&>label]:mb-2",
    "ui:FieldTemplate": FieldTemplate,
    "ui:options": {
      label: false,
      inline: true,
    },
  },
<<<<<<< HEAD
  monetary_payments: {
    "ui:widget": MonetaryPaymentsGrid,
    "ui:classNames": "text-bc-bg-blue mt-8 [&>label]:mb-2",
    "ui:FieldTemplate": FieldTemplate,
    "ui:options": {
      label: false,
      inline: true,
    },
  },
=======
  // monetary_payments: {
  //   "ui:widget": MonetaryPaymentsGrid,
  //   "ui:classNames": "text-bc-bg-blue mt-8 [&>label]:mb-2",
  //   "ui:FieldTemplate": FieldTemplate,
  //   "ui:options": {
  //     inline: true,
  //   },
  // },
>>>>>>> 9a5fa2ba9 (chore: update schema field names as model names)

  // Outstanding Compliance Obligation Section
  outstanding_obligation_header: headerUiConfig,
  outstanding_balance: tco2eUiConfig,
  outstanding_balance_equivalent_value: currencyUiConfig,

  // Penalty Section
  penalty_header: headerUiConfig,
  penalty_alert: {
    "ui:widget": AutomaticOverduePenaltyAlertNote,
    "ui:options": {
      label: false,
      inline: true,
    },
  },
  penalty_status: commonReadOnlyOptions,
  penalty_type: commonReadOnlyOptions,
<<<<<<< HEAD
  penalty_charge_rate: {
=======
  penalty_rate_daily: {
>>>>>>> 9a5fa2ba9 (chore: update schema field names as model names)
    ...commonReadOnlyOptions,
    "ui:options": {
      suffix: "%",
    },
  },
  days_late: commonReadOnlyOptions,
  accumulated_penalty: currencyUiConfig,
  accumulated_compounding: currencyUiConfig,
  penalty_today: currencyUiConfig,
  faa_interest: currencyUiConfig,
  total_amount: currencyUiConfig,
};
