import { RJSFSchema, UiSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import { EarnedCreditsAlertNote } from "@/compliance/src/app/components/compliance-summary/request-issuance/review-compliance-summary/EarnedCreditsAlertNote";
import {
  readOnlyStringField,
  readOnlyObjectField,
  commonReadOnlyOptions,
  tco2eUiConfig,
  headerUiConfig,
} from "@/compliance/src/app/data/jsonSchema/helpers";

// Section creators
const createSummarySection = (
  reportingYear: number,
): RJSFSchema["properties"] => ({
  summaryHeader: readOnlyObjectField(`From ${reportingYear} Report`),
  emissionsAttributableForCompliance: readOnlyStringField(
    "Emissions Attributable for Compliance:",
  ),
  emissionLimit: readOnlyStringField("Emissions Limit:"),
  excessEmissions: readOnlyStringField("Excess Emissions:"),
});

const createEarnedCreditsSection = (): RJSFSchema["properties"] => ({
  earnedCreditsHeader: readOnlyObjectField("Earned Credits"),
  earnedCreditsAlert: readOnlyStringField(),
  earnedCredits: readOnlyStringField("Earned Credits:"),
  issuanceStatus: readOnlyStringField("Status of Issuance:"),
});

// Main schema creator
export const createComplianceSummaryReviewSchema = (
  reportingYear: number,
): RJSFSchema => ({
  type: "object",
  title: `Review ${reportingYear} Compliance Summary`,
  properties: {
    ...createSummarySection(reportingYear),
    ...createEarnedCreditsSection(),
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

  // Earned Credits Section
  earnedCreditsHeader: headerUiConfig,
  earnedCreditsAlert: {
    "ui:widget": EarnedCreditsAlertNote,
    "ui:options": {
      label: false,
      inline: true,
    },
  },
  earnedCredits: commonReadOnlyOptions,
  issuanceStatus: commonReadOnlyOptions,
};
