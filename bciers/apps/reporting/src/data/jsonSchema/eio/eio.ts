import { RJSFSchema } from "@rjsf/utils";
import {
  FieldTemplate,
  TitleOnlyFieldTemplate,
} from "@bciers/components/form/fields";

export const eioSchema: RJSFSchema = {
  title: "Electricity Import Data",
  type: "object",
  properties: {
    note: {
      title: "TO DO",
      type: "string",
    },
  },
};

export const eioUiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  "ui:order": ["note"],
  note: {
    "ui:FieldTemplate": TitleOnlyFieldTemplate,
    "ui:classNames": "mt-2 mb-5",
  },
};
