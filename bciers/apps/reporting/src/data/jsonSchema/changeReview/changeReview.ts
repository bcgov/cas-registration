import { RJSFSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import { TitleOnlyFieldTemplate } from "@bciers/components/form/fields";
import SectionFieldTemplate from "@bciers/components/form/fields/SectionFieldTemplate";
import { ComplianceNote } from "@reporting/src/data/jsonSchema/changeReview/complianceNote";
import TextAreaWidget from "@bciers/components/form/widgets/TextAreaWidget";

export const changeReviewSchema: RJSFSchema = {
  type: "object",
  title: "Reason for Edits",
  properties: {
    error_reason_section: {
      type: "object",
      properties: {
        compliance_note: { type: "object", readOnly: true },
        reason_for_error: {
          type: "boolean",
          title:
            "Please explain the reason for submitting this supplementary report. Include an explanation for why each inaccuracy or omission in the previous report occurred.",
        },
      },
    },
  },
};

export const changeReviewUiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",

  error_reason_section: {
    "ui:FieldTemplate": SectionFieldTemplate,
    "ui:options": { label: false },
    "ui:order": ["compliance_note", "reason_for_error"],
    compliance_note: {
      "ui:FieldTemplate": TitleOnlyFieldTemplate,
      "ui:title": ComplianceNote,
    },
    reason_for_error: {
      "ui:widget": TextAreaWidget,
    },
  },
};
