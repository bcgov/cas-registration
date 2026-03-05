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
    penalty_status: readOnlyStringField("Status:"),
    penalty_type: readOnlyStringField("Penalty Type:"),
    penalty_charge_rate: readOnlyStringField("Penalty Rate (Daily):"),
    total_penalty: readOnlyStringField("Penalty Amount:"),
    faa_interest: readOnlyStringField("FAA Interest (Annual):"),
    total_amount: readOnlyStringField("Total Amount:"),
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
  total_penalty: currencyUiConfig,
  faa_interest: currencyUiConfig,
  total_amount: currencyUiConfig,
};
