import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import { RJSFSchema, UiSchema } from "@rjsf/utils";

export const newEntrantOperationSchema: RJSFSchema = {
  title: "New Entrant Operation",
  type: "object",
  properties: {
    new_entrant_operation: {
      type: "string",
      title: "New Entrant Operation",
    },
  },
};

export const newEntrantOperationUiSchema: UiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
};
