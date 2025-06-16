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
import InternalDirectorReviewApprovalNote from "@/compliance/src/app/data/jsonSchema/requestIssuance/internal/InternalDirectorReviewApprovalNote";
import InternalDirectorReviewChangesNote from "@/compliance/src/app/data/jsonSchema/requestIssuance/internal/InternalDirectorReviewChangesNote";

const createCreditsIssuanceRequestSection = (): RJSFSchema["properties"] => ({
  section_header: readOnlyObjectField("Earned Credits"),
  earned_credits_amount: readOnlyStringField("Earned Credits:"),
  issuance_status: readOnlyStringField("Status of Issuance:"),
  bccr_trading_name: readOnlyStringField("BCCR Trading Name:"),
  holding_account_id: readOnlyStringField("BCCR Holding Account ID:"),
});

const createAnalystReviewSection = (): RJSFSchema["properties"] => ({
  analyst_header: readOnlyObjectField("Reviewed by Analyst"),
  analyst_comment: readOnlyStringField("Analyst's Comment:"),
});

const createDirectorReviewSection = (): RJSFSchema["properties"] => ({
  director_header: readOnlyObjectField("Review by Director"),
  director_comment: {
    type: "string",
    title: "Director's Comment:",
  },
});

export const internalReviewByDirectorSchema: RJSFSchema = {
  type: "object",
  title: "Review by Director",
  properties: {
    view_annual_report_button: readOnlyObjectField(),
    ...createCreditsIssuanceRequestSection(),
    ...createAnalystReviewSection(),
    ...createDirectorReviewSection(),
    analyst_recommendation: {
      type: "string",
      enum: ["ready_to_approve", "require_changes"],
    },
  },
  dependencies: {
    analyst_recommendation: {
      oneOf: [
        {
          properties: {
            analyst_recommendation: { enum: ["ready_to_approve"] },
            approval_note: readOnlyStringField(),
          },
        },
        {
          properties: {
            analyst_recommendation: { enum: ["require_changes"] },
            changes_note: readOnlyStringField(),
          },
        },
      ],
    },
  },
};

const fixedWidthLabelStyle = {
  ...commonReadOnlyOptions,
  "ui:classNames": `${commonReadOnlyOptions["ui:classNames"]} [&>div:first-child]:w-[240px] [&>div:first-child]:mr-[10px]`,
};

export const internalReviewByDirectorUiSchema: UiSchema = {
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
  analyst_comment: fixedWidthLabelStyle,

  director_header: headerUiConfig,
  director_comment: {
    "ui:widget": CommentWidget,
    "ui:classNames":
      "[&>div>label]:text-[16px] [&>div:first-child]:min-w-[240px] [&>div:last-child]:w-full  [&>div:last-child]:ml-[10px] [&>div:last-child>div]:w-full [&>div:last-child>div>div]:w-full mb-[2px]",
  },
  approval_note: {
    "ui:widget": InternalDirectorReviewApprovalNote,
    "ui:options": {
      label: false,
      inline: true,
    },
  },
  changes_note: {
    "ui:widget": InternalDirectorReviewChangesNote,
    "ui:options": {
      label: false,
      inline: true,
    },
  },

  analyst_recommendation: {
    "ui:widget": "hidden",
  },
};
