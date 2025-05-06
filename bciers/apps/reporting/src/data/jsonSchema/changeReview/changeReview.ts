import { RJSFSchema } from "@rjsf/utils";
import {
  FieldTemplate,
  TitleOnlyFieldTemplate,
} from "@bciers/components/form/fields";

export const changeReviewSchema: RJSFSchema = {
  title: "Reason for Edits",
  type: "object",
  properties: {
    reason_for_change: {
      type: "string",
      title:
        "Please explain the reason for submitting this supplementary report. Include an explanation for why each inaccuracy or omission in the previous report occurred:",
    },
  },
  required: ["reason_for_change"],
};

export const changeReviewUiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:order": ["reason_for_change"],
  reason_for_change: {
    "ui:widget": "TextareaWidget",
    "ui:placeholder": "Enter your reason here…",
    "ui:options": {
      rows: 5,
    },
    "ui:FieldTemplate": TitleOnlyFieldTemplate,
  },
};
