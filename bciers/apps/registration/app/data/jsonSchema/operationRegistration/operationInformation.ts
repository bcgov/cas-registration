import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import { RJSFSchema, UiSchema } from "@rjsf/utils";

export const operationInformationSchema: RJSFSchema = {
  title: "Operation Information",
  type: "object",
  properties: {
    name: {
      type: "string",
      title: "Name",
    },
  },
};

export const operationInformationUiSchema: UiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
};
