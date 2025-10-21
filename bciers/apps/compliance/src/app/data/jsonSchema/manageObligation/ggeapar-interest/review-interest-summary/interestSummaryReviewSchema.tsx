import { RJSFSchema, UiSchema } from "@rjsf/utils";
import {
  readOnlyObjectField,
  readOnlyStringField,
  commonReadOnlyOptions,
  headerUiConfig,
  currencyUiConfig,
} from "@/compliance/src/app/data/jsonSchema/helpers";
import { GGEAPARInterestAlertNote } from "@/compliance/src/app/components/compliance-summary/manage-obligation/ggeapar-interest/review-interest-summary/GGEAPARInterestAlertNote";
import { FieldTemplate } from "@bciers/components/form/fields";

export const createInterestSummaryReviewSchema = (
  reportingYear: number,
): RJSFSchema => ({
  type: "object",
  title: `Review ${reportingYear} GGEAPAR Interest`,
  properties: {
    interest_header: readOnlyObjectField("GGEAPAR Interest"),
    interest_alert: readOnlyStringField(),
    penalty_status: readOnlyStringField("Status:"),
    penalty_charge_rate: readOnlyStringField("GGEAPAR Interest Rate (Annual):"),
    penalty_amount: readOnlyStringField("GGEAPAR Interest Amount:"),
    faa_interest: readOnlyStringField("FAA Interest (Annual):"),
    total_amount: readOnlyStringField("Total Amount:"),
  },
});

export const interestSummaryReviewUiSchema: UiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",

  interest_header: headerUiConfig,
  interest_alert: {
    "ui:widget": GGEAPARInterestAlertNote,
    "ui:options": {
      label: false,
      inline: true,
    },
  },
  penalty_status: commonReadOnlyOptions,
  penalty_charge_rate: {
    ...commonReadOnlyOptions,
    "ui:options": {
      suffix: "%",
    },
  },
  penalty_amount: currencyUiConfig,
  faa_interest: currencyUiConfig,
  total_amount: currencyUiConfig,
};
