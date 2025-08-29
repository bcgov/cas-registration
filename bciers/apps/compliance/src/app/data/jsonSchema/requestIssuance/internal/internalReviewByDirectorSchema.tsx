import { RJSFSchema, UiSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import {
  readOnlyStringField,
  readOnlyObjectField,
  commonReadOnlyOptions,
  headerUiConfig,
} from "@/compliance/src/app/data/jsonSchema/helpers";
import InternalDirectorReviewAwaitingNote from "@/compliance/src/app/data/jsonSchema/requestIssuance/internal/InternalDirectorReviewAwaitingNote";
import InternalDirectorReviewChangesNote from "@/compliance/src/app/data/jsonSchema/requestIssuance/internal/InternalDirectorReviewChangesNote";
import { IssuanceRequestStatusTextWidget } from "@/compliance/src/app/data/jsonSchema/IssuanceRequestStatusTextWidget";
import { IssuanceStatus } from "@bciers/utils/src/enums";

export const internalReviewByDirectorSchema: RJSFSchema = {
  type: "object",
  title: "Review by Director",
  properties: {
    earned_credits_header: readOnlyObjectField("Earned Credits"),
    earned_credits_amount: readOnlyStringField("Earned Credits:"),
    issuance_status: readOnlyStringField("Status of Issuance:"),
    bccr_trading_name: readOnlyStringField("BCCR Trading Name:"),
    bccr_holding_account_id: readOnlyStringField("BCCR Holding Account ID:"),
    analyst_header: readOnlyObjectField("Reviewed by Analyst"),
    analyst_comment: readOnlyStringField("Analyst's Comment:"),
    analyst_suggestion: {
      type: "string",
      default: "",
    },
    director_header: readOnlyObjectField("Review by Director"),
    director_comment: {
      type: "string",
      title: "Director's Comment:",
    },
  },
  dependencies: {
    issuance_status: {
      oneOf: [
        {
          properties: {
            issuance_status: {
              enum: [IssuanceStatus.ISSUANCE_REQUESTED],
            },
            awaiting_note: readOnlyStringField(),
          },
        },
        {
          properties: {
            issuance_status: { enum: [IssuanceStatus.CHANGES_REQUIRED] },
            changes_note: readOnlyStringField(),
          },
        },
        {
          properties: {
            issuance_status: { enum: [IssuanceStatus.DECLINED] },
            director_comment: readOnlyStringField("Director's Comment:"),
            declined_note: readOnlyStringField(),
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
    "earned_credits_header",
    "earned_credits_amount",
    "issuance_status",
    "bccr_trading_name",
    "bccr_holding_account_id",
    "analyst_header",
    "analyst_comment",
    "analyst_suggestion",
    "director_header",
    "director_comment",
    "changes_note",
    "declined_note",
    "awaiting_note",
  ],
  earned_credits_header: headerUiConfig,
  earned_credits_amount: commonReadOnlyOptions,
  issuance_status: {
    "ui:widget": IssuanceRequestStatusTextWidget,
  },
  bccr_trading_name: commonReadOnlyOptions,
  bccr_holding_account_id: commonReadOnlyOptions,
  analyst_header: headerUiConfig,
  analyst_comment: commonReadOnlyOptions,
  analyst_suggestion: {
    "ui:widget": "hidden",
  },
  director_header: headerUiConfig,
  director_comment: {
    "ui:widget": "TextAreaWidget",
    // to make the textarea full width and align the label to the top
    "ui:classNames": "md:gap-16 [&>div:last-child]:w-full",
  },
  awaiting_note: {
    "ui:widget": InternalDirectorReviewAwaitingNote,
    "ui:classNames": "[&>div>div]:w-full", // To match the width of comments section
    "ui:options": {
      label: false,
      inline: true,
    },
  },
  changes_note: {
    "ui:widget": InternalDirectorReviewChangesNote,
    "ui:classNames": "[&>div>div]:w-full", // To match the width of comments section
    "ui:options": {
      label: false,
      inline: true,
    },
  },
};
