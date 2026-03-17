import { RJSFSchema, UiSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import {
  readOnlyObjectField,
  readOnlyStringField,
  commonReadOnlyOptions,
  headerUiConfig,
  currencyUiConfig,
} from "@/compliance/src/app/data/jsonSchema/helpers";
import { InternalPenaltyFAAInterestAlertNote } from "@/compliance/src/app/components/compliance-summary/manage-obligation/internal/review-penalty-summary/InternalPenaltyFAAInterestAlertNote";

export const createInternalPenaltySummaryReviewSchema: RJSFSchema = {
  type: "object",
  title: "Review Penalty Summary",
  properties: {
    penalty_header: readOnlyObjectField("Automatic Overdue Penalty"),
    penalty_alert: readOnlyStringField(),
    penalty_status: readOnlyStringField("Status:"),
    penalty_type: readOnlyStringField("Penalty Type:"),
    penalty_charge_rate: readOnlyStringField("Penalty Rate (Daily):"),
    total_penalty: readOnlyStringField("Penalty Amount:"),
    faa_interest: readOnlyStringField("FAA Interest (Annual):"),
    total_amount: readOnlyStringField("Total Amount:"),
  },
};

export const internalPenaltySummaryReviewUiSchema: UiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",

  penalty_header: headerUiConfig,
  penalty_alert: {
    "ui:widget": InternalPenaltyFAAInterestAlertNote,
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
