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
import { IssuanceRequestStatusTextWidget } from "@/compliance/src/app/data/jsonSchema/IssuanceRequestStatusTextWidget";

export const internalTrackStatusOfIssuanceSchema: RJSFSchema = {
  type: "object",
  title: "Track Status of Issuance",
  properties: {
    status_header: readOnlyObjectField("Earned Credits"),
    earned_credits_amount: readOnlyStringField("Earned Credits:"),
    issuance_status: readOnlyStringField("Status of Issuance:"),
    bccr_trading_name: readOnlyStringField("BCCR Trading Name:"),
    bccr_holding_account_id: readOnlyStringField("BCCR Holding Account ID:"),
    director_comment: readOnlyStringField("Director's Comment:"),
  },

  dependencies: {
    issuance_status: {
      oneOf: [
        {
          properties: {
            issuance_status: {
              enum: [IssuanceStatus.APPROVED],
            },
            approved_note: readOnlyStringField(),
          },
        },
        {
          properties: {
            issuance_status: {
              enum: [IssuanceStatus.DECLINED],
            },
            declined_note: readOnlyStringField(),
          },
        },
      ],
    },
  },
};

export const internalTrackStatusOfIssuanceUiSchema: UiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  // need this because we don't control the order of the fields in the dependencies
  "ui:order": [
    "status_header",
    "approved_note",
    "declined_note",
    "earned_credits_amount",
    "issuance_status",
    "bccr_trading_name",
    "bccr_holding_account_id",
    "director_comment",
  ],
  status_header: headerUiConfig,
  earned_credits_amount: commonReadOnlyOptions,
  approved_note: {
    "ui:widget": InternalIssuanceStatusApprovedNote,
    "ui:options": { label: false, inline: true },
  },
  declined_note: {
    "ui:widget": InternalIssuanceStatusDeclinedNote,
    "ui:options": { label: false, inline: true },
  },
  earned_credits: commonReadOnlyOptions,
  issuance_status: {
    "ui:widget": IssuanceRequestStatusTextWidget,
  },
  bccr_trading_name: commonReadOnlyOptions,
  bccr_holding_account_id: commonReadOnlyOptions,
  director_comment: commonReadOnlyOptions,
};
