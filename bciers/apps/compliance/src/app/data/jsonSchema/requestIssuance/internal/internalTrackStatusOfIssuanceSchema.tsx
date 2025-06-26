import { RJSFSchema, UiSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import {
  headerUiConfig,
  readOnlyObjectField,
  readOnlyStringField,
  commonReadOnlyOptions,
} from "@/compliance/src/app/data/jsonSchema/helpers";
import { InternalIssuanceStatusApprovedNote } from "@/compliance/src/app/components/compliance-summary/request-issuance/internal/track-status-of-issuance/InternalIssuanceStatusApprovedNote";
import { InternalIssuanceStatusDeclinedNote } from "@/compliance/src/app/components/compliance-summary/request-issuance/internal/track-status-of-issuance/InternalIssuanceStatusDeclinedNote";
import { IssuanceStatus } from "@bciers/utils/src/enums";
import { StatusTextWidget } from "@/compliance/src/app/data/jsonSchema/StatusTextWidget";

export const internalTrackStatusOfIssuanceSchema: RJSFSchema = {
  type: "object",
  title: "Track Status of Issuance",
  properties: {
    status_header: readOnlyObjectField("Earned Credits"),
    earned_credits: readOnlyStringField("Earned Credits:"),
    issuance_status: readOnlyStringField("Status of Issuance:"),
    bccr_trading_name: readOnlyStringField("BCCR Trading Name:"),
    holding_account_id: readOnlyStringField("BCCR Holding Account ID:"),
  },

  dependencies: {
    issuance_status: {
      oneOf: [
        {
          properties: {
            issuance_status: {
              enum: [IssuanceStatus.APPROVED, IssuanceStatus.CREDITS_ISSUED],
            },
            approved_note: readOnlyStringField(),
            directors_comments: readOnlyStringField("Director's Comments:"),
          },
        },
        {
          properties: {
            issuance_status: {
              enum: [
                IssuanceStatus.DECLINED,
                IssuanceStatus.CREDITS_NOT_ISSUED,
              ],
            },
            declined_note: readOnlyStringField(),
            directors_comments: readOnlyStringField("Director's Comments:"),
          },
        },
      ],
    },
  },
};

export const internalTrackStatusOfIssuanceUiSchema: UiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  "ui:order": [
    "status_header",
    "approved_note",
    "declined_note",
    "earned_credits",
    "issuance_status",
    "bccr_trading_name",
    "holding_account_id",
    "directors_comments",
    "analysts_comments",
  ],
  status_header: headerUiConfig,
  approved_note: {
    "ui:widget": InternalIssuanceStatusApprovedNote,
    "ui:options": { label: false, inline: true },
  },
  declined_note: {
    "ui:widget": InternalIssuanceStatusDeclinedNote,
    "ui:options": { label: false, inline: true },
  },
  earned_credits: commonReadOnlyOptions,
  bccr_trading_name: commonReadOnlyOptions,
  holding_account_id: commonReadOnlyOptions,
  directors_comments: commonReadOnlyOptions,
  analysts_comments: commonReadOnlyOptions,
  issuance_status: {
    "ui:widget": StatusTextWidget,
  },
};
