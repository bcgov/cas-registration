import { RJSFSchema, UiSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
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
  earnedCredits: readOnlyStringField("Earned Credits:"),
  issuanceStatus: readOnlyStringField("Status of Issuance:"),
});

export const createInternalComplianceSummaryReviewSchema = (
  reportingYear: number,
): RJSFSchema => ({
  type: "object",
  title: `Review ${reportingYear} Compliance Summary`,
  properties: {
    ...createSummarySection(reportingYear),
    ...createEarnedCreditsSection(),
  },
});

export const internalComplianceSummaryReviewUiSchema: UiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",

  summaryHeader: {
    ...headerUiConfig,
    "ui:classNames": "text-bc-bg-blue mt-0 mb-2",
  },
  emissionsAttributableForCompliance: tco2eUiConfig,
  emissionLimit: tco2eUiConfig,
  excessEmissions: tco2eUiConfig,
  earnedCreditsHeader: headerUiConfig,
  earnedCredits: commonReadOnlyOptions,
  issuanceStatus: commonReadOnlyOptions,
};
