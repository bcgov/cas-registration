import { RJSFSchema } from "@rjsf/utils";
import provinceOptions from "@bciers/data/provinces.json";
import SectionFieldTemplate from "@bciers/components/form/fields/SectionFieldTemplate";

const section1: RJSFSchema = {
  type: "object",
  title: "Personal Information",
  required: ["first_name", "last_name"],
  properties: {
    existing_bciers_user: {
      type: "boolean",
      default: true,
      title: "Is this contact a user in BCIERS?",
    },
    first_name: {
      type: "string",
      title: "First Name",
    },
    last_name: {
      type: "string",
      title: "Last Name",
    },
  },
  allOf: [
    {
      if: {
        properties: {
          existing_bciers_user: {
            const: true,
          },
        },
      },
      then: {
        required: ["selected_user"],
        properties: {
          selected_user: {
            type: "string",
            title: "Select the user",
          },
        },
      },
    },
  ],
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
    },
    phone_number: {
      type: "string",
      title: "Business Telephone Number",
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

export const contactsSchema: RJSFSchema = {
  type: "object",
  required: ["section1", "section2", "section3", "section4"],
  properties: {
    section1,
    section2,
    section3,
    section4,
  },
};

export const contactsUiSchema = {
  "ui:FieldTemplate": SectionFieldTemplate,
  "ui:options": {
    label: false,
  },
  section1: {
    "ui:FieldTemplate": SectionFieldTemplate,
    "ui:order": [
      "existing_bciers_user",
      "selected_user",
      "first_name",
      "last_name",
    ],
    existing_bciers_user: {
      "ui:widget": "ToggleWidget",
    },
    selected_user: {
      "ui:widget": "ComboBox",
      "ui:placeholder": "Select the user",
    },
  },
  section2: {
    "ui:FieldTemplate": SectionFieldTemplate,
  },
  section3: {
    "ui:FieldTemplate": SectionFieldTemplate,
    email: {
      "ui:widget": "EmailWidget",
    },
    phone_number: {
      "ui:widget": "PhoneWidget",
    },
  },
  section4: {
    "ui:FieldTemplate": SectionFieldTemplate,
    province: {
      "ui:widget": "ComboBox",
    },
    postal_code: {
      "ui:widget": "PostalCodeWidget",
    },
  },
};
