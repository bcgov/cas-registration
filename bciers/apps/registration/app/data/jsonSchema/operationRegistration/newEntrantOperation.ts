import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import TitleOnlyFieldTemplate from "@bciers/components/form/fields/TitleOnlyFieldTemplate";
import { GenerateNewEntrantFormMessageDefault } from "apps/registration/app/components/operations/registration/form/titles";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import { newEntrantApril1OrLater } from "@bciers/utils/src/urls";

export const newEntrantOperationSchema: RJSFSchema = {
  title: "New Entrant Application",
  type: "object",
  required: ["new_entrant_application"],
  properties: {
    new_entrant_operation_section: {
      type: "object",
      title: "New Entrant Operation",
      readOnly: true,
    },
    new_entrant_application: {
      type: "string",
      title: "Upload application and statutory declaration",
      format: "data-url",
    },
  },
};

export const newEntrantOperationUiSchema: UiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  "ui:order": ["new_entrant_operation_section", "new_entrant_application"],
  new_entrant_operation_section: {
    "ui:FieldTemplate": TitleOnlyFieldTemplate,
    "ui:title": GenerateNewEntrantFormMessageDefault(newEntrantApril1OrLater),
  },
  new_entrant_application: {
    "ui:widget": "FileWidget",
    "ui:options": {
      accept: ".pdf",
      label: false,
      filePreview: true,
      uploadLabel: "Upload application and statutory declaration",
    },
  },
};
