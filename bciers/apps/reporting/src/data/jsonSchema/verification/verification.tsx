import { RJSFSchema, UiSchema } from "@rjsf/utils";
import { FieldTemplate } from "@bciers/components/form/fields";

const sharedSchemaProperties: RJSFSchema["properties"] = {
  verification_body_name: {
    title: "Verification body name",
    type: ["string", "null"],
  },
  accredited_by: {
    title: "Accredited by",
    type: ["string", "null"],
    enum: ["ANAB", "SCC", null],
  },
  threats_to_independence: {
    title: "Were there any threats to independence noted",
    type: ["boolean", "null"],
  },
};

const sharedRequiredFields = [
  "verification_body_name",
  "accredited_by",
  "threats_to_independence",
];

const sharedUiSchema: UiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  verification_body_name: {
    "ui:placeholder": "Enter verification body name",
  },
  accredited_by: {
    "ui:placeholder": "Select accrediting body",
    "ui:emptyValue": null,
  },
  threats_to_independence: {
    "ui:widget": "RadioWidget",
  },
};

const sharedUIOrder = [
  "info_note",
  "verification_body_name",
  "accredited_by",
  "threats_to_independence",
];

export const sfoSchema: RJSFSchema = {
  type: "object",
  title: "Verification",
  required: sharedRequiredFields,
  properties: {
    ...sharedSchemaProperties,
  },
};

export const sfoUiSchema: UiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  "ui:order": sharedUIOrder,
  ...sharedUiSchema,
};

export const lfoSchema: RJSFSchema = {
  type: "object",
  title: "Verification",
  required: sharedRequiredFields,
  properties: {
    ...sharedSchemaProperties,
  },
};

export const lfoUiSchema: UiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  "ui:order": sharedUIOrder,
  ...sharedUiSchema,
};
