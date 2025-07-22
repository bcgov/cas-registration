import { RJSFSchema, UiSchema } from "@rjsf/utils";
import {
  readOnlyObjectField,
  readOnlyStringField,
  commonReadOnlyOptions,
  headerUiConfig,
  currencyUiConfig,
} from "@/compliance/src/app/data/jsonSchema/helpers";
import { FAAInterestAlertNote } from "@/compliance/src/app/components/compliance-summary/manage-obligation/automatic-overdue-penalty/review-penalty-summary/FAAInterestAlertNote";
import { FieldTemplate } from "@bciers/components/form/fields";

export const createPenaltySummaryReviewSchema = (
  reportingYear: number,
): RJSFSchema => ({
  type: "object",
  title: `Review ${reportingYear} Automatic Overdue Penalty`,
  properties: {
    penalty_header: readOnlyObjectField("Penalty"),
    penalty_alert: readOnlyStringField(),
    penalty_status: readOnlyStringField("Penalty Status:"),
    penalty_type: readOnlyStringField("Penalty Type:"),
    days_late: readOnlyStringField("Days Late:"),
    penalty_charge_rate: readOnlyStringField("Penalty Rate (Daily):"),
    accumulated_penalty: readOnlyStringField("Accumulated Penalty:"),
    accumulated_compounding: readOnlyStringField("Accumulated Compounding:"),
    total_penalty: readOnlyStringField("Penalty Amount:"),
    faa_interest: readOnlyStringField("FAA Interest (as of Today):"),
    total_amount: readOnlyStringField("Total Amount (as of Today):"),
  },
});

export const penaltySummaryReviewUiSchema: UiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",

  penalty_header: headerUiConfig,
  penalty_alert: {
    "ui:widget": FAAInterestAlertNote,
    "ui:options": {
      label: false,
      inline: true,
    },
  },
  penalty_status: commonReadOnlyOptions,
  penalty_type: commonReadOnlyOptions,
  penalty_charge_rate: {
    ...commonReadOnlyOptions,
    "ui:options": {
      suffix: "%",
    },
  },
  days_late: commonReadOnlyOptions,
  accumulated_penalty: currencyUiConfig,
  accumulated_compounding: currencyUiConfig,
  total_penalty: currencyUiConfig,
  faa_interest: currencyUiConfig,
  total_amount: currencyUiConfig,
};
