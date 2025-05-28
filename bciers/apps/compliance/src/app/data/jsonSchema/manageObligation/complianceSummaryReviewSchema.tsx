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
  reportingYear: number,
): RJSFSchema => ({
  type: "object",
  title: `Review ${reportingYear} Compliance Summary`,
  properties: {
    // Summary Section
    summaryHeader: readOnlyObjectField(`From ${reportingYear} Report`),
    emissionsAttributableForCompliance: readOnlyStringField(
      "Emissions Attributable for Compliance:",
    ),
    emissionLimit: readOnlyStringField("Emissions Limit:"),
    excessEmissions: readOnlyStringField("Excess Emissions:"),
    // Obligation Section
    obligationHeader: readOnlyObjectField(
      `${reportingYear} Compliance Obligation`,
    ),
    obligationId: readOnlyStringField("Obligation ID:"),
    complianceChargeRate: readOnlyStringField(
      `${reportingYear} Compliance Charge Rate:`,
    ),
    equivalentValue: readOnlyStringField("Equivalent Value:"),
    // Compliance Units Section
    complianceUnits: readOnlyStringField("Compliance Units Applied"),
    // Monetary Payments Section
    monetaryPayments: readOnlyStringField("Monetary Payments Made"),
    // Outstanding Compliance Obligation Section
    outstandingObligationHeader: readOnlyObjectField(
      "Outstanding Compliance Obligation",
    ),
    outstandingBalance: readOnlyStringField("Outstanding Balance:"),
    outstandingBalanceEquivalentValue: readOnlyStringField("Equivalent Value:"),
    // Penalty Section
    penaltyHeader: readOnlyObjectField(
      "Automatic Overdue Penalty (as of Today):",
    ),
    penaltyAlert: readOnlyStringField(),
    penaltyStatus: readOnlyStringField("Penalty Status:"),
    penaltyType: readOnlyStringField("Penalty Type:"),
    penaltyChargeRate: readOnlyStringField("Penalty Rate (Daily):"),
    daysLate: readOnlyStringField("Days Late:"),
    accumulatedPenalty: readOnlyStringField("Accumulated Penalty:"),
    accumulatedCompounding: readOnlyStringField("Accumulated Compounding:"),
    penaltyToday: readOnlyStringField("Penalty (as of Today):"),
    faaInterest: readOnlyStringField("FAA Interest (as of Today):"),
    totalAmount: readOnlyStringField("Total Amount (as of Today):"),
  },
});

export const complianceSummaryReviewUiSchema: UiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",

  // Summary Section
  summaryHeader: headerUiConfig,
  emissionsAttributableForCompliance: tco2eUiConfig,
  emissionLimit: tco2eUiConfig,
  excessEmissions: tco2eUiConfig,

  // Obligation Section
  obligationHeader: headerUiConfig,
  obligationId: commonReadOnlyOptions,
  complianceChargeRate: {
    ...commonReadOnlyOptions,
    "ui:options": {
      prefix: "$",
      displayUnit: " /tCO2e",
    },
  },
  equivalentValue: {
    ...commonReadOnlyOptions,
    "ui:options": {
      prefix: "$",
      displayUnit: "tCO2e",
    },
  },
  complianceUnits: {
    "ui:widget": ComplianceUnitsGrid,
    "ui:classNames": "text-bc-bg-blue mt-8 [&>label]:mb-2",
    "ui:FieldTemplate": FieldTemplate,
    "ui:options": {
      inline: true,
    },
  },
  monetaryPayments: {
    "ui:widget": MonetaryPaymentsGrid,
    "ui:classNames": "text-bc-bg-blue mt-8 [&>label]:mb-2",
    "ui:FieldTemplate": FieldTemplate,
    "ui:options": {
      inline: true,
    },
  },

  // Outstanding Compliance Obligation Section
  outstandingObligationHeader: headerUiConfig,
  outstandingBalance: tco2eUiConfig,
  outstandingBalanceEquivalentValue: currencyUiConfig,

  // Penalty Section
  penaltyHeader: headerUiConfig,
  penaltyAlert: {
    "ui:widget": AutomaticOverduePenaltyAlertNote,
    "ui:options": {
      label: false,
      inline: true,
    },
  },
  penaltyStatus: commonReadOnlyOptions,
  penaltyType: commonReadOnlyOptions,
  penaltyChargeRate: {
    ...commonReadOnlyOptions,
    "ui:options": {
      suffix: "%",
    },
  },
  daysLate: commonReadOnlyOptions,
  accumulatedPenalty: currencyUiConfig,
  accumulatedCompounding: currencyUiConfig,
  penaltyToday: currencyUiConfig,
  faaInterest: currencyUiConfig,
  totalAmount: currencyUiConfig,
};
