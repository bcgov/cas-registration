import { RJSFSchema } from "@rjsf/utils";
import provinceOptions from "@bciers/data/provinces.json";
import SectionHeaderFieldTemplate from "@bciers/components/form/fields/SectionHeaderFieldTemplate";
import {
  PlacesAssignedFieldTemplate,
  PlacesAssignedFieldItemTemplate,
} from "@bciers/components/form/fields/PlacesAssignedFieldTemplate";

export const contactsSchema: RJSFSchema = {
  type: "object",
  required: [
    "first_name",
    "last_name",
    "position_title",
    "email",
    "phone_number",
    "street_address",
    "municipality",
    "province",
    "postal_code",
  ],
  properties: {
    personal_information_title: {
      type: "string",
      title: "Personal Information",
    },
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
    work_information_title: {
      type: "string",
      title: "Work Information",
    },
    position_title: {
      type: "string",
      title: "Job Title / Position",
    },
    contact_information_title: {
      type: "string",
      title: "Contact Information",
    },
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
    address_information_title: {
      type: "string",
      title: "Address Information",
    },
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

export const contactsUiSchema = {
  personal_information_title: {
    "ui:FieldTemplate": SectionHeaderFieldTemplate,
  },
  places_assigned: {
    "ui:ArrayFieldTemplate": PlacesAssignedFieldTemplate,
    "ui:ArrayFieldItemTemplate": PlacesAssignedFieldItemTemplate,
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
  work_information_title: {
    "ui:FieldTemplate": SectionHeaderFieldTemplate,
  },
  contact_information_title: {
    "ui:FieldTemplate": SectionHeaderFieldTemplate,
  },
  email: {
    "ui:widget": "EmailWidget",
  },
  phone_number: {
    "ui:widget": "PhoneWidget",
  },
  address_information_title: {
    "ui:FieldTemplate": SectionHeaderFieldTemplate,
  },
  province: {
    "ui:widget": "ComboBox",
  },
  postal_code: {
    "ui:widget": "PostalCodeWidget",
  },
};
