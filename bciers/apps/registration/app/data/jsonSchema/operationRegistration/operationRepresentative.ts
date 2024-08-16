import {
  ArrayFieldTemplate,
  TitleOnlyFieldTemplate,
} from "@bciers/components/form/fields";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import {
  operationRepresentativeAdd,
  operationRepresentativePreface,
} from "./titles";
import { contactsUiSchema } from "@/administration/app/data/jsonSchema/contact";

export const operationRepresentativeSchema: RJSFSchema = {
  title: "Operation Representative",
  type: "object",
  properties: {
    operation_representative_preface: {
      //Not an actual field in the db - this is just to make the form look like the wireframes
      type: "object",
      readOnly: true,
    },
    operation_representatives: {
      type: "array",
      items: {},
      title: "Operation Representative",
    },
    operation_representative_add: {
      //Not an actual field in the db - this is just to make the form look like the wireframes
      type: "object",
      readOnly: true,
    },
    new_operation_representatives: {
      type: "array",
      items: {},
      title: "Operation Representative",
    },
  },
};

export const operationRepresentativeUiSchema: UiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  "ui:order": [
    "operation_representative_preface",
    "operation_representatives",
    "operation_representative_add",
    "new_operation_representatives",
  ],
  operation_representative_preface: {
    "ui:FieldTemplate": TitleOnlyFieldTemplate,
    "ui:title": operationRepresentativePreface,
  },

  operation_representatives: {
    "ui:widget": "MultiSelectWidget",
  },
  operation_representative_add: {
    "ui:FieldTemplate": TitleOnlyFieldTemplate,
    "ui:title": operationRepresentativeAdd,
  },
  new_operation_representatives: {
    items: contactsUiSchema,
    "ui:FieldTemplate": FieldTemplate,
    "ui:ArrayFieldTemplate": ArrayFieldTemplate,
    "ui:options": {
      label: false,
      arrayAddLabel: "Add another representative",
      title: "Operation Representative",
    },
  },
};
