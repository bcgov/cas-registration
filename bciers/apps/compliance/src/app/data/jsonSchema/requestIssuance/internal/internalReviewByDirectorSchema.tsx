import { RJSFSchema, UiSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import {
  readOnlyStringField,
  readOnlyObjectField,
  commonReadOnlyOptions,
  headerUiConfig,
} from "@/compliance/src/app/data/jsonSchema/helpers";
import { AnnualEmissionsReportButtonField } from "@/compliance/src/app/data/jsonSchema/AnnualEmissionsReportButton";
import InternalDirectorReviewApprovalNote from "@/compliance/src/app/data/jsonSchema/requestIssuance/internal/InternalDirectorReviewApprovalNote";
import InternalDirectorReviewChangesNote from "@/compliance/src/app/data/jsonSchema/requestIssuance/internal/InternalDirectorReviewChangesNote";
import { StatusTextWidget } from "@/compliance/src/app/data/jsonSchema/StatusTextWidget";
import { TextWidget } from "@bciers/components/form/widgets";

const createCreditsIssuanceRequestSection = (): RJSFSchema["properties"] => ({
  earned_credits_header: readOnlyObjectField("Earned Credits"),
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
});

export const internalReviewByDirectorSchema: RJSFSchema = {
  type: "object",
  title: "Review by Director",
  properties: {
    view_annual_report_button: readOnlyObjectField(),
    ...createCreditsIssuanceRequestSection(),
    ...createAnalystReviewSection(),
    ...createDirectorReviewSection(),
    read_only: {
      type: "boolean",
    },
    analyst_recommendation: {
      type: "string",
      enum: ["ready_to_approve", "require_changes"],
    },
  },
  dependencies: {
    read_only: {
      oneOf: [
        {
          properties: {
            read_only: { const: false },
            editable_director_comment: {
              title: "Director's Comment:",
              type: "string",
            },
          },
        },
        {
          properties: {
            read_only: { const: true },
            readonly_director_comment: readOnlyStringField(
              "Director's Comment:",
            ),
          },
        },
      ],
    },
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

export const internalReviewByDirectorUiSchema: UiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  "ui:order": [
    "view_annual_report_button",
    "earned_credits_header",
    "earned_credits_amount",
    "issuance_status",
    "bccr_trading_name",
    "holding_account_id",
    "analyst_header",
    "analyst_comment",
    "director_header",
    "editable_director_comment",
    "readonly_director_comment",
    "approval_note",
    "changes_note",
    "analyst_recommendation",
    "read_only",
  ],
  view_annual_report_button: {
    "ui:field": AnnualEmissionsReportButtonField,
    "ui:options": {
      label: false,
    },
  },

  earned_credits_header: headerUiConfig,
  earned_credits_amount: commonReadOnlyOptions,
  issuance_status: {
    "ui:widget": StatusTextWidget,
  },
  bccr_trading_name: commonReadOnlyOptions,
  holding_account_id: commonReadOnlyOptions,

  analyst_header: headerUiConfig,
  analyst_comment: commonReadOnlyOptions,

  director_header: headerUiConfig,
  read_only: {
    "ui:widget": "hidden",
  },
  editable_director_comment: {
    "ui:widget": TextWidget,
    "ui:classNames": "[&>div:nth-child(2)]:w-9/12 [&_input]:py-[8px]",
  },
  readonly_director_comment: commonReadOnlyOptions,
  analyst_recommendation: {
    "ui:widget": "hidden",
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
};
