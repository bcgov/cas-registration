import { RJSFSchema } from "@rjsf/utils";
import FieldTemplate from "@/app/styles/rjsf/FieldTemplate";

export const selectOperatorSchema: RJSFSchema = {
  type: "object",
  required: ["operator_id"],
  properties: {
    operator_id: { type: "number", title: "Select Operator", anyOf: [] },
  },
};

export const selectOperatorUiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  operator_id: {
    "ui:widget": "ComboBox",
  },
};
