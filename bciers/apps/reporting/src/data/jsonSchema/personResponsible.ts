import {
  ArrayFieldTemplate,
  FieldTemplate,
  TitleOnlyFieldTemplate,
} from "@bciers/components/form/fields";
import { RJSFSchema, UiSchema } from "@rjsf/utils";

export const personResponsibleManualEntrySchema: RJSFSchema = {
  type: "object",
  definitions: {
    Contact: {
      type: "object",
      properties: {
        first_name: { type: "string", title: " First name" },
        last_name: { type: "string" },
        position_title: { type: "string" },
        email: { type: "string" },
        phone_number: { type: "string" },
        mailing_address: { type: "string" },
      },
    },
  },
  properties: {
    enter_manually_title: {
      type: "object",
      readOnly: true,
    },
    manual_contacts: {
      type: "array",
      items: {
        $ref: "#/definitions/Contact",
      },
    },
    test_prop: {
      type: "string",
      title: "test prop!",
    },
  },
};

export const personResponsibleManualEntryUiSchema: UiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  enter_manually_title: {
    "ui:FieldTemplate": TitleOnlyFieldTemplate,
    "ui:title": "Or enter new contact information manually",
  },
  manual_contacts: {
    "ui:FieldTemplate": FieldTemplate,
    "ui:ArrayFieldTemplate": ArrayFieldTemplate,
    items: {}, // Here goes the schema for the individual items
    "ui:options": {
      label: false,
      title: "Blarg",
      style: { width: "100%", textAlign: "left" },
      arrayAddLabel: "+ Add another contact",
    },
  },
  test_prop: {
    "ui:FieldTemplate": FieldTemplate,
    "ui:options": { style: { width: "100%", textAlign: "left" } },
  },
  "ui:submitButtonOptions": {
    norender: true,
  },
};
