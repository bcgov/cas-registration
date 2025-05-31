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
  summary_header: readOnlyObjectField(`From ${reportingYear} Report`),
  emissions_attributable_for_compliance: readOnlyStringField(
    "Emissions Attributable for Compliance:",
  ),
  emission_limit: readOnlyStringField("Emissions Limit:"),
  excess_emissions: readOnlyStringField("Excess Emissions:"),
});

const createEarnedCreditsSection = (): RJSFSchema["properties"] => ({
  earned_credits_header: readOnlyObjectField("Earned Credits"),
  earned_credits: readOnlyStringField("Earned Credits:"),
  issuance_status: readOnlyStringField("Status of Issuance:"),
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

  summary_header: {
    ...headerUiConfig,
    "ui:classNames": "text-bc-bg-blue mt-0 mb-2",
  },
  emissions_attributable_for_compliance: tco2eUiConfig,
  emission_limit: tco2eUiConfig,
  excess_emissions: tco2eUiConfig,
  earned_credits_header: headerUiConfig,
  earned_credits: commonReadOnlyOptions,
  issuance_status: commonReadOnlyOptions,
};
