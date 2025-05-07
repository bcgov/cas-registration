import { RJSFSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import { TitleOnlyFieldTemplate } from "@bciers/components/form/fields";
import { ComplianceNote } from "@reporting/src/data/jsonSchema/changeReview/complianceNote";
import TextAreaWidget from "@bciers/components/form/widgets/TextAreaWidget";

export const changeReviewSchema: RJSFSchema = {
  type: "object",
  title: "Reason for Edits",
  required: ["reason_for_change"],
  properties: {
    compliance_note: { type: "object", readOnly: true },
    reason_for_change: {
      type: "string",
      title:
        "Please explain the reason for submitting this supplementary report. Include an explanation for why each inaccuracy or omission in the previous report occurred.",
    },
  },
};

export const changeReviewUiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  "ui:order": ["compliance_note", "reason_for_change"],
  compliance_note: {
    "ui:FieldTemplate": TitleOnlyFieldTemplate,
    "ui:title": ComplianceNote,
  },
  reason_for_change: {
    "ui:widget": TextAreaWidget,
  },
};
