import { RJSFSchema, UiSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import { Link } from "@mui/material";
import { bcCarbonRegistryLink } from "@bciers/utils/src/urls";
import HiddenFieldTemplate from "@bciers/components/form/fields/HiddenFieldTemplate";
import { ReadOnlyWidget } from "@bciers/components/form/widgets/readOnly";
import BCCRHoldingAccountWidget from "@/compliance/src/app/widgets/BccrHoldingAcountWidget";
import { TitleOnlyFieldTemplate } from "@bciers/components/form/fields";
import { readOnlyObjectField, readOnlyStringField } from "@/compliance/src/app/data/jsonSchema/helpers";

export const requestIssuanceOfEarnedCreditsSchema: RJSFSchema = {
  type: "object",
  title: "Request Issuance of Earned Credits",
  required: ["bccrHoldingAccountId"],
  properties: {
    bccrAccountHeader: readOnlyObjectField("B.C. Carbon Registry (BCCR) Account Information"),
    bccrHoldingAccountId: {
      type: "string",
      title: "BCCR Holding Account ID:",
      pattern: "^\\d{15}$",
      maxLength: 15,
      minLength: 15,
    },
    bccrTradingName: readOnlyStringField("BCCR Trading Name:"),
  },
};

export const requestIssuanceOfEarnedCreditsUiSchema: UiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  bccrAccountHeader: {
    "ui:classNames": "text-bc-bg-blue mt-1",
    "ui:FieldTemplate": TitleOnlyFieldTemplate,
  },
  bccrHoldingAccountId: {
    "ui:widget": BCCRHoldingAccountWidget,
    "ui:classNames": "[&>div:first-child]:w-1/3", // modify the width of the label
    "ui:help": (
      <small>
        No account?{" "}
        <Link
          href={bcCarbonRegistryLink}
          underline="hover"
          className="text-bc-link-blue font-medium"
          rel="noopener noreferrer"
          target="_blank"
        >
          Create account
        </Link>{" "}
        in BCCR.
      </small>
    ),
    "ui:options": {
      inline: true,
    },
  },
  bccrTradingName: {
    "ui:FieldTemplate": HiddenFieldTemplate,
    "ui:widget": ReadOnlyWidget,
  },
};
