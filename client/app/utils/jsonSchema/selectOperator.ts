import { RJSFSchema } from "@rjsf/utils";

export const selectOperatorSchema: RJSFSchema = {
  type: "object",
  required: ["operator_id"],
  properties: {
    operator_id: { type: "number", title: "Select Operator", anyOf: [] },
  },
};

export const selectOperatorUiSchema = {
  operator_id: {
    "ui:widget": "ComboBox",
  },
};
