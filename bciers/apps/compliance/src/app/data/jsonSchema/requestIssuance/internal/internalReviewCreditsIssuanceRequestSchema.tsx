import { RJSFSchema, UiSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import {
  readOnlyStringField,
  readOnlyObjectField,
  commonReadOnlyOptions,
  headerUiConfig,
} from "@/compliance/src/app/data/jsonSchema/helpers";
import CommentWidget from "@/compliance/src/app/data/jsonSchema/CommentWidget";
import { AnnualEmissionsReportButtonField } from "@/compliance/src/app/data/jsonSchema/AnnualEmissionsReportButton";

const createCreditsIssuanceRequestSection = (): RJSFSchema["properties"] => ({
  section_header: readOnlyObjectField("Earned Credits"),
  earned_credits_amount: readOnlyStringField("Earned Credits:"),
  issuance_status: readOnlyStringField("Status of Issuance:"),
  bccr_trading_name: readOnlyStringField("BCCR Trading Name:"),
  holding_account_id: readOnlyStringField("BCCR Holding Account ID:"),
});

const createAnalystReviewSection = (): RJSFSchema["properties"] => ({
  analyst_header: readOnlyObjectField("Review by Analyst"),
  analyst_recommendation: {
    type: "string",
    title: "Analyst's Suggestion:",
    oneOf: [
      {
        const: "ready_to_approve",
        title: "Ready to approve",
      },
      {
        const: "require_changes",
        title: "Require changes",
      },
    ],
  },
  analyst_comment: {
    type: "string",
    title: "Analyst's Comment:",
  },
});

export const internalReviewCreditsIssuanceRequestSchema: RJSFSchema = {
  type: "object",
  title: "Review Credits Issuance Request",
  properties: {
    view_annual_report_button: readOnlyObjectField(),
    ...createCreditsIssuanceRequestSection(),
    ...createAnalystReviewSection(),
  },
};

const fixedWidthLabelStyle = {
  ...commonReadOnlyOptions,
  "ui:classNames": `${commonReadOnlyOptions["ui:classNames"]} [&>div:first-child]:w-[240px] [&>div:first-child]:mr-[10px]`,
};

export const internalReviewCreditsIssuanceRequestUiSchema: UiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",

  view_annual_report_button: {
    "ui:field": AnnualEmissionsReportButtonField,
    "ui:options": {
      label: false,
    },
  },

  section_header: headerUiConfig,
  earned_credits_amount: fixedWidthLabelStyle,
  issuance_status: fixedWidthLabelStyle,
  bccr_trading_name: fixedWidthLabelStyle,
  holding_account_id: fixedWidthLabelStyle,

  analyst_header: headerUiConfig,
  analyst_recommendation: {
    "ui:widget": "RadioWidget",
    "ui:classNames":
      "[&>div>label]:text-[16px] [&>div:first-child]:w-[240px] [&>div:last-child]:w-auto [&>div:last-child]:ml-[10px] ",
    "ui:options": {
      inline: true,
      required: false,
    },
  },
  analyst_comment: {
    "ui:widget": CommentWidget,
    "ui:classNames":
      "[&>div>label]:text-[16px] [&>div:first-child]:min-w-[240px] [&>div:last-child]:w-full [&>div:last-child]:ml-[10px] [&>div:last-child>div]:w-full [&>div:last-child>div>div]:w-full",
    "ui:disabled": true,
  },
};
