import { RJSFSchema } from "@rjsf/utils";
import provinceOptions from "@bciers/data/provinces.json";
import SectionFieldTemplate from "@bciers/components/form/fields/SectionFieldTemplate";
import { PlacesAssignedFieldTemplate } from "@bciers/components/form/fields";

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
    places_assigned: {
      type: "array",
      title: "Places assigned",
      readOnly: true,
      items: {
        type: "object",
        properties: {
          role_name: { type: "string" },
          operation_name: { type: "string" },
          operation_id: { type: "string" },
        },
      },
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
  required: ["street_address", "municipality", "province", "postal_code"],
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
    "ui:order": ["selected_user", "first_name", "last_name", "places_assigned"],
    places_assigned: {
      "ui:ArrayFieldTemplate": PlacesAssignedFieldTemplate,
      "ui:classNames": "[&>div:last-child]:w-2/3",
      items: {
        "ui:widget": "ReadOnlyWidget",
        "ui:options": {
          label: false,
          inline: true,
        },
        role_name: {
          "ui:options": {
            label: false,
          },
        },
        operation_name: {
          "ui:options": {
            label: false,
          },
        },
        operation_id: {
          "ui:widget": "hidden",
        },
      },
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
