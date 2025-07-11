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
// TODO in #227 import { AutomaticOverduePenaltyAlertNote } from "@/compliance/src/app/components/compliance-summary/manage-obligation/review-compliance-summary/AutomaticOverduePenaltyAlertNote";
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
    outstanding_balance: readOnlyStringField("Outstanding Balance:"),
    outstanding_balance_equivalent_value:
      readOnlyStringField("Equivalent Value:"),
    // TODO in #227
    // Penalty Section
    // penalty_header: readOnlyObjectField(
    //   "Automatic Overdue Penalty (as of Today):",
    // ),
    // penalty_alert: readOnlyStringField(),
    // penalty_status: readOnlyStringField("Penalty Status:"),
    // penalty_type: readOnlyStringField("Penalty Type:"),
    // penalty_charge_rate: readOnlyStringField("Penalty Rate (Daily):"),
    // days_late: readOnlyStringField("Days Late:"),
    // accumulated_penalty: readOnlyStringField("Accumulated Penalty:"),
    // accumulated_compounding: readOnlyStringField("Accumulated Compounding:"),
    // penalty_today: readOnlyStringField("Penalty (as of Today):"),
    // faa_interest: readOnlyStringField("FAA Interest (as of Today):"),
    // total_amount: readOnlyStringField("Total Amount (as of Today):"),
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
  outstanding_balance: {
    "ui:widget": "ReadOnlyCurrencyWidget",
  },
  outstanding_balance_equivalent_value: {
    "ui:widget": "ReadOnlyCurrencyWidget",
  },
  // TODO in #227
  // Penalty Section
  // penalty_header: headerUiConfig,
  // penalty_alert: {
  //   "ui:widget": AutomaticOverduePenaltyAlertNote,
  //   "ui:options": {
  //     label: false,
  //     inline: true,
  //   },
  // },
  // penalty_status: commonReadOnlyOptions,
  // penalty_type: commonReadOnlyOptions,
  // penalty_charge_rate: {
  //   ...commonReadOnlyOptions,
  //   "ui:options": {
  //     suffix: "%",
  //   },
  // },
  // days_late: commonReadOnlyOptions,
  // accumulated_penalty: {
  //   "ui:widget": "ReadOnlyCurrencyWidget",
  // },
  // accumulated_compounding: {
  //   "ui:widget": "ReadOnlyCurrencyWidget",
  // },
  // penalty_today: {
  //   "ui:widget": "ReadOnlyCurrencyWidget",
  // },
  // faa_interest: {
  //   "ui:widget": "ReadOnlyCurrencyWidget",
  // },
  // total_amount: {
  //   "ui:widget": "ReadOnlyCurrencyWidget",
  // },
};
