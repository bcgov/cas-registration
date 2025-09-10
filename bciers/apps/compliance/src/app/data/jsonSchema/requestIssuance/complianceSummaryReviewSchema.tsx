import { RJSFSchema, UiSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import { EarnedCreditsAlertNote } from "@/compliance/src/app/components/compliance-summary/request-issuance/review-compliance-earned-credits-report/EarnedCreditsAlertNote";
import {
  readOnlyStringField,
  readOnlyObjectField,
  commonReadOnlyOptions,
  tco2eUiConfig,
  headerUiConfig,
} from "@/compliance/src/app/data/jsonSchema/helpers";
import { IssuanceRequestStatusTextWidget } from "@/compliance/src/app/data/jsonSchema/IssuanceRequestStatusTextWidget";

// Main schema creator
export const createComplianceSummaryReviewSchema = (
  reportingYear: number,
): RJSFSchema => ({
  type: "object",
  title: `Review ${reportingYear} Compliance Report`,
  properties: {
    // Earned Credits Section
    earned_credits_header: readOnlyObjectField("Earned Credits"),
    earned_credits_alert: readOnlyStringField(),
    earned_credits_amount: readOnlyStringField("Earned Credits:"),
    issuance_status: readOnlyStringField("Status of Issuance:"),
  },
});

export const complianceSummaryReviewUiSchema = (
  isCasStaff: boolean,
): UiSchema => ({
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",

  // Summary Section
  summary_header: headerUiConfig,
  emissions_attributable_for_compliance: tco2eUiConfig,
  emissions_limit: tco2eUiConfig,
  excess_emissions: tco2eUiConfig,

  // Earned Credits Section
  earned_credits_header: headerUiConfig,
  earned_credits_alert: {
    "ui:widget": isCasStaff ? () => null : EarnedCreditsAlertNote,
    "ui:options": {
      label: false,
      inline: true,
    },
  },
  earned_credits_amount: commonReadOnlyOptions,
  issuance_status: {
    "ui:widget": IssuanceRequestStatusTextWidget,
  },
});
