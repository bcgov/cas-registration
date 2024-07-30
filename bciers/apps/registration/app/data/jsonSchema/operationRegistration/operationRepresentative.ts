import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import { RJSFSchema, UiSchema } from "@rjsf/utils";

export const operationRepresentativeSchema: RJSFSchema = {
  title: "Operation Representative",
  type: "object",
  properties: {
    name: {
      type: "string",
      title: "Name",
    },
  },
};

export const operationRepresentativeUiSchema: UiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
};
