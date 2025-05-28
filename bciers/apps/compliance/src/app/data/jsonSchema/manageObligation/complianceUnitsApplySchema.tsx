import { RJSFSchema, UiSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import { Link } from "@mui/material";
import { bcCarbonRegistryLink } from "@bciers/utils/src/urls";
import HiddenFieldTemplate from "@bciers/components/form/fields/HiddenFieldTemplate";
import { ReadOnlyWidget } from "@bciers/components/form/widgets/readOnly";
import BCCRHoldingAccountWidget from "@/compliance/src/app/widgets/BccrHoldingAcountWidget";
import {
  headerUiConfig,
  readOnlyObjectField,
  readOnlyStringField,
} from "@/compliance/src/app/data/jsonSchema/helpers";

export const complianceUnitsApplySchema: RJSFSchema = {
  type: "object",
  title: "Apply Compliance Units",
  required: ["bccrHoldingAccountId"],
  properties: {
    bccrAccountHeader: readOnlyObjectField("Enter account ID"),
    bccrHoldingAccountId: {
      type: "string",
      title: "BCCR Holding Account ID:",
      pattern: "^\\d{15}$",
      maxLength: 15,
      minLength: 15,
    },
    bccrTradingName: readOnlyStringField("BCCR Trading Name:"),
    bccrComplianceAccountId: readOnlyStringField("BCCR Compliance Account ID:"),
  },
};

export const complianceUnitsApplyUiSchema: UiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  bccrAccountHeader: headerUiConfig,
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
  bccrComplianceAccountId: {
    "ui:FieldTemplate": HiddenFieldTemplate,
    "ui:widget": ReadOnlyWidget,
  },
};
