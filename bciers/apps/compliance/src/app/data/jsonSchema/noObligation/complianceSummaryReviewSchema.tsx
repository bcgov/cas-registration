import { RJSFSchema, UiSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import {
  readOnlyObjectField,
  readOnlyStringField,
  tco2eUiConfig,
  headerUiConfig,
} from "@/compliance/src/app/data/jsonSchema/helpers";
import { NoObligationOrCreditsAlertNote } from "@/compliance/src/app/components/compliance-summary/no-obligation/review-summary/NoObligationOrCreditsAlertNote";

export const complianceSummaryReviewSchema = (
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
    // Compliance Status Section
    compliance_status_header: readOnlyObjectField("Compliance Status"),
    no_obligation_or_credit_alert: readOnlyStringField(),
  },
});

export const complianceSummaryReviewUiSchema = (
  reportingYear: number,
): UiSchema => ({
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",

  // Summary Section
  summary_header: headerUiConfig,
  emissions_attributable_for_compliance: tco2eUiConfig,
  emissions_limit: tco2eUiConfig,
  excess_emissions: tco2eUiConfig,

  // Compliance Status Section
  compliance_status_header: headerUiConfig,
  no_obligation_or_credit_alert: {
    "ui:widget": () => {
      return NoObligationOrCreditsAlertNote(reportingYear);
    },
    "ui:options": {
      label: false,
      inline: true,
    },
  },
});
