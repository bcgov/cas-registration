import { RJSFSchema, UiSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import {
  headerUiConfig,
  readOnlyObjectField,
  readOnlyStringField,
  commonReadOnlyOptions,
} from "@/compliance/src/app/data/jsonSchema/helpers";
import { IssuanceStatusApprovedNote } from "@/compliance/src/app/components/compliance-summary/request-issuance/track-status-of-issuance/IssuanceStatusApprovedNote";
import { IssuanceStatusAwaitingNote } from "@/compliance/src/app/components/compliance-summary/request-issuance/track-status-of-issuance/IssuanceStatusAwaitingNote";
import { IssuanceStatus } from "@bciers/utils/src/enums";
import { StatusTextWidget } from "@/compliance/src/app/data/jsonSchema/StatusTextWidget";

export const trackStatusOfIssuanceSchema: RJSFSchema = {
  type: "object",
  title: "Track Status of Issuance",
  properties: {
    status_header: readOnlyObjectField("Status of Issuance"),
    earned_credits: readOnlyStringField("Earned Credits:"),
    issuance_status: readOnlyStringField("Status of Issuance:"),
    bccr_trading_name: readOnlyStringField("BCCR Trading Name:"),
  },

  dependencies: {
    issuance_status: {
      oneOf: [
        {
          properties: {
            issuance_status: { enum: [IssuanceStatus.APPROVED] },
            approved_note: readOnlyStringField(),
            directors_comments: readOnlyStringField("Director's Comments:"),
          },
        },
        {
          properties: {
            issuance_status: { enum: [IssuanceStatus.AWAITING] },
            awaiting_note: readOnlyStringField(),
          },
        },
      ],
    },
  },
};

export const trackStatusOfIssuanceUiSchema: UiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  "ui:order": [
    "status_header",
    "approved_note",
    "awaiting_note",
    "earned_credits",
    "status_text",
    "bccr_trading_name",
    "directors_comments",
    "issuance_status",
  ],
  status_header: headerUiConfig,
  approved_note: {
    "ui:widget": IssuanceStatusApprovedNote,
    "ui:options": { label: false, inline: true },
  },
  awaiting_note: {
    "ui:widget": IssuanceStatusAwaitingNote,
    "ui:options": { label: false, inline: true },
  },
  earned_credits: commonReadOnlyOptions,
  status_text: commonReadOnlyOptions,
  bccr_trading_name: commonReadOnlyOptions,
  directors_comments: commonReadOnlyOptions,

  issuance_status: {
    "ui:widget": StatusTextWidget,
  },
};
