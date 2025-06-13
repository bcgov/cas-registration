import { RJSFSchema, UiSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import HiddenFieldTemplate from "@bciers/components/form/fields/HiddenFieldTemplate";
import { ReadOnlyWidget } from "@bciers/components/form/widgets/readOnly";
import {
  headerUiConfig,
  readOnlyObjectField,
  readOnlyStringField,
} from "@/compliance/src/app/data/jsonSchema/helpers";

export const requestIssuanceOfEarnedCreditsSchema: RJSFSchema = {
  type: "object",
  title: "Request Issuance of Earned Credits",
  required: ["bccrHoldingAccountId"],
  properties: {
    bccr_account_header: readOnlyObjectField(
      "B.C. Carbon Registry (BCCR) Account Information",
    ),
    bccr_holding_account_id: {
      type: "string",
      title: "BCCR Holding Account ID:",
    },
    bccr_trading_name: readOnlyStringField("BCCR Trading Name:"),
  },
};

export const requestIssuanceOfEarnedCreditsUiSchema: UiSchema = {
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
};
