import { RJSFSchema, UiSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import {
  headerUiConfig,
  readOnlyObjectField,
  readOnlyStringField,
  commonReadOnlyOptions,
} from "@/compliance/src/app/data/jsonSchema/helpers";
import { StatusTextWidget } from "@/compliance/src/app/data/jsonSchema/StatusTextWidget";
import { CreditIssuanceStatusWidget } from "@/compliance/src/app/data/jsonSchema/requestIssuance/CreditIssuanceStatusWidget";
import { IssuanceStatus } from "@bciers/utils/src/enums";
export const trackStatusOfIssuanceSchema: RJSFSchema = {
  type: "object",
  title: "Track Status of Issuance",
  properties: {
    status_header: readOnlyObjectField("Status of Issuance"),
    status_note: readOnlyStringField(""),
    earned_credits: readOnlyStringField("Earned Credits:"),
    issuance_status: readOnlyStringField("Status of Issuance:"),
    bccr_trading_name: readOnlyStringField("BCCR Trading Name:"),
  },
  allOf: [
    {
      if: {
        properties: {
          issuance_status: {
            enum: [IssuanceStatus.APPROVED, IssuanceStatus.DECLINED],
          },
        },
      },
      then: {
        properties: {
          directors_comments: readOnlyStringField("Director's Comments:"),
        },
      },
    },
    {
      if: {
        properties: {
          issuance_status: { enum: [IssuanceStatus.CHANGES_REQUIRED] },
        },
      },
      then: {
        properties: {
          analysts_comments: readOnlyStringField("Analyst's Comments:"),
        },
      },
    },
  ],
};

export const trackStatusOfIssuanceUiSchema: UiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",

  status_header: {
    ...headerUiConfig,
    "ui:classNames": "text-bc-bg-blue mt-0 mb-2",
  },
  status_note: {
    "ui:widget": CreditIssuanceStatusWidget,
    "ui:options": {
      label: false,
      inline: true,
    },
  },
  earned_credits: commonReadOnlyOptions,
  issuance_status: {
    ...commonReadOnlyOptions,
    "ui:widget": StatusTextWidget,
  },
  bccr_trading_name: commonReadOnlyOptions,
  directors_comments: commonReadOnlyOptions,
  analysts_comments: commonReadOnlyOptions,
};
