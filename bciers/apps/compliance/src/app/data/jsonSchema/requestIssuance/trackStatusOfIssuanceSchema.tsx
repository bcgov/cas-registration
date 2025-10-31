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
import { IssuanceStatusDeclinedNote } from "@/compliance/src/app/components/compliance-summary/request-issuance/track-status-of-issuance/IssuanceStatusDeclinedNote";
import { IssuanceStatusChangesRequiredNote } from "@/compliance/src/app/components/compliance-summary/request-issuance/track-status-of-issuance/IssuanceStatusChangesRequiredNote";
import { IssuanceStatus } from "@bciers/utils/src/enums";
import { IssuanceRequestStatusTextWidget } from "@/compliance/src/app/data/jsonSchema/IssuanceRequestStatusTextWidget";
import { IssuanceStatusSupplementaryDeclinedNote } from "@/compliance/src/app/components/compliance-summary/request-issuance/track-status-of-issuance/IssuanceStatusSupplementaryDeclinedNote";

export const trackStatusOfIssuanceSchema: RJSFSchema = {
  type: "object",
  title: "Track Status of Issuance",
  properties: {
    status_header: readOnlyObjectField("Status of Issuance"),
    earned_credits_amount: readOnlyStringField("Earned Credits:"),
    issuance_status: readOnlyStringField("Status of Issuance:"),
    bccr_trading_name: readOnlyStringField("BCCR Trading Name:"),
  },

  dependencies: {
    issuance_status: {
      allOf: [
        {
          if: {
            properties: {
              issuance_status: { const: IssuanceStatus.DECLINED },
              supplementary_declined: { const: true },
            },
          },
          then: {
            properties: {
              issuance_status: { const: IssuanceStatus.DECLINED },
              supplementary_declined_note: readOnlyStringField(),
            },
          },
        },
        {
          if: {
            properties: {
              issuance_status: { const: IssuanceStatus.DECLINED },
              supplementary_declined: { const: false },
            },
          },
          then: {
            properties: {
              issuance_status: { const: IssuanceStatus.DECLINED },
              declined_note: readOnlyStringField(),
              director_comment: readOnlyStringField("Director's Comment:"),
            },
          },
        },
      ],
      oneOf: [
        {
          properties: {
            issuance_status: { enum: [IssuanceStatus.APPROVED] },
            approved_note: readOnlyStringField(),
            director_comment: readOnlyStringField("Director's Comment:"),
          },
        },
        {
          properties: {
            issuance_status: { enum: [IssuanceStatus.CHANGES_REQUIRED] },
            changes_required_note: readOnlyStringField(),
            analyst_comment: readOnlyStringField("Analyst’s Comment:"),
          },
        },
        {
          properties: {
            issuance_status: { enum: [IssuanceStatus.ISSUANCE_REQUESTED] },
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
  // need this because we don't control the order of the fields in the dependencies
  "ui:order": [
    "status_header",
    "approved_note",
    "awaiting_note",
    "declined_note",
    "supplementary_declined_note",
    "changes_required_note",
    "earned_credits_amount",
    "issuance_status",
    "bccr_trading_name",
    "director_comment",
    "analyst_comment",
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
  declined_note: {
    "ui:widget": IssuanceStatusDeclinedNote,
    "ui:options": { label: false, inline: true },
  },
  supplementary_declined_note: {
    "ui:widget": IssuanceStatusSupplementaryDeclinedNote,
    "ui:options": { label: false, inline: true },
  },
  changes_required_note: {
    "ui:widget": IssuanceStatusChangesRequiredNote,
    "ui:options": { label: false, inline: true },
  },
  earned_credits_amount: commonReadOnlyOptions,
  bccr_trading_name: commonReadOnlyOptions,
  director_comment: commonReadOnlyOptions,
  analyst_comment: commonReadOnlyOptions,
  issuance_status: {
    "ui:widget": IssuanceRequestStatusTextWidget,
  },
};
