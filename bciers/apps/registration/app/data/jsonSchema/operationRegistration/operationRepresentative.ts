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
import provinceOptions from "@bciers/data/provinces.json";

// Temp contact schema
const section1: RJSFSchema = {
  type: "object",
  title: "Personal Information",
  required: ["first_name", "last_name"],
  properties: {
    first_name: {
      type: "string",
      title: "First Name",
    },
    last_name: {
      type: "string",
      title: "Last Name",
    },
  },
};

const section2: RJSFSchema = {
  type: "object",
  title: "Work Information",
  required: ["position_title"],
  properties: {
    position_title: {
      type: "string",
      title: "Job Title / Position",
    },
  },
};

const section3: RJSFSchema = {
  type: "object",
  title: "Contact Information",
  required: ["email", "phone_number"],
  properties: {
    email: {
      type: "string",
      title: "Business Email Address",
      format: "email",
    },
    phone_number: {
      type: "string",
      title: "Business Telephone Number",
      format: "phone",
    },
  },
};

const section4: RJSFSchema = {
  type: "object",
  title: "Address Information",
  properties: {
    street_address: {
      type: "string",
      title: "Business Mailing Address",
    },
    municipality: {
      type: "string",
      title: "Municipality",
    },
    province: {
      type: "string",
      title: "Province",
      anyOf: provinceOptions,
    },
    postal_code: {
      type: "string",
      title: "Postal Code",
      format: "postal-code",
    },
  },
};

export const tempContactsSchema: RJSFSchema = {
  type: "object",
  required: ["section1", "section2", "section3", "section4"],
  properties: {
    section1,
    section2,
    section3,
    section4,
  },
};

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
    "new_operation_representatives",
  ],
  operation_representative_preface: {
    "ui:FieldTemplate": TitleOnlyFieldTemplate,
    "ui:title": operationRepresentativePreface,
  },

  operation_representatives: {
    "ui:widget": "MultiSelectWidget",
    // RJSF has "ui:help" but it doesn't play nice with the MultiSelectWidget that is why we are using a custom name ("ui:helperText")
    "ui:helperText": operationRepresentativeAdd,
    "ui:placeholder": "Select an individual",
  },
  new_operation_representatives: {
    items: contactsUiSchema,
    "ui:FieldTemplate": FieldTemplate,
    "ui:ArrayFieldTemplate": ArrayFieldTemplate,
    "ui:options": {
      label: false,
      arrayAddLabel: "Add Another Operation Representative",
      title: "Operation Representative",
    },
  },
};
