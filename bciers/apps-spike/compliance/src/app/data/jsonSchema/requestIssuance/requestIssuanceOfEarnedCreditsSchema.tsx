import { RJSFSchema, UiSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import HiddenFieldTemplate from "@bciers/components/form/fields/HiddenFieldTemplate";
import { ReadOnlyWidget } from "@bciers/components/form/widgets/readOnly";
import {
  headerUiConfig,
  readOnlyObjectField,
  readOnlyStringField,
} from "@/compliance/src/app/data/jsonSchema/helpers";
import { IssuanceStatus } from "@bciers/utils/src/enums";
import { ChangesRequiredAlertNote } from "@/compliance/src/app/components/compliance-summary/request-issuance/request-issuance-of-earned-credits/ChangesRequiredAlertNote";

export const requestIssuanceOfEarnedCreditsSchema: RJSFSchema = {
  type: "object",
  title: "Request Issuance of Earned Credits",
  required: ["bccr_holding_account_id"],
  properties: {
    bccr_account_header: readOnlyObjectField(
      "B.C. Carbon Registry (BCCR) Account Information",
    ),

    issuance_status: readOnlyStringField(),
    bccr_holding_account_id: {
      type: "string",
      title: "BCCR Holding Account ID:",
    },
    bccr_trading_name: readOnlyStringField("BCCR Trading Name:"),
  },
  dependencies: {
    issuance_status: {
      oneOf: [
        {
          properties: {
            issuance_status: { enum: [IssuanceStatus.CHANGES_REQUIRED] },
            changes_required_alert: readOnlyStringField(),
          },
        },
      ],
    },
  },
};

export const requestIssuanceOfEarnedCreditsUiSchema: UiSchema = {
  "ui:order": [
    "bccr_account_header",
    "changes_required_alert",
    "bccr_holding_account_id",
    "bccr_trading_name",
    "issuance_status",
  ],
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  bccr_account_header: headerUiConfig,
  bccr_holding_account_id: {
    "ui:widget": "BccrHoldingAccountWidget",
    "ui:classNames": "[&>div:first-child]:w-1/3", // modify the width of the label
    "ui:options": {
      inline: true,
    },
  },
  bccr_trading_name: {
    "ui:FieldTemplate": HiddenFieldTemplate,
    "ui:widget": ReadOnlyWidget,
  },
  changes_required_alert: {
    "ui:widget": ChangesRequiredAlertNote,
    "ui:options": { label: false, inline: true },
  },
  issuance_status: {
    "ui:widget": "hidden",
  },
};
