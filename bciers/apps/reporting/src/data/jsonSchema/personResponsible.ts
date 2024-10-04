import { TitleOnlyFieldTemplate } from "@bciers/components/form/fields";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import { infoNote } from "@reporting/src/data/jsonSchema/personResponsibleInfoText";
import SectionFieldTemplate from "@bciers/components/form/fields/SectionFieldTemplate";

// Person Responsible Schema
export const personResponsibleSchema: RJSFSchema = {
  title: "Person Responsible",
  type: "object",
  properties: {
    purpose_note: {
      type: "object",
      readOnly: true,
    },
    assign_info: {
      type: "object",
      readOnly: true,
      title:
        "Assign someone responsible for this report for the purpose of contacting",
    },
    person_responsible: {
      type: "string",
      title: "Select contact if they are already a BCIERS user ",
    },
  },
};

// UI Schema for Person Responsible
export const personResponsibleUiSchema: UiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  "ui:order": [
    "purpose_note",
    "assign_info",
    "person_responsible",
    "new_person_responsible",
    "contact_details",
  ],
  purpose_note: {
    "ui:FieldTemplate": TitleOnlyFieldTemplate,
    "ui:title": infoNote,
  },
  assign_info: {
    "ui:FieldTemplate": SectionFieldTemplate,
  },
  person_responsible: {
    "ui:widget": "SelectWidget",
    "ui:placeholder": "Select an individual",
  },
  contact_details: {
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
        "places_assigned",
      ],
      // first_name: {
      //   "ui:widget": "ReadOnlyWidget",
      // },
      // last_name: {
      //   "ui:widget": "ReadOnlyWidget",
      // },
    },
    section2: {
      "ui:FieldTemplate": SectionFieldTemplate,
      // position_title: {
      //   "ui:widget": "ReadOnlyWidget",
      // },
    },
    section3: {
      "ui:FieldTemplate": SectionFieldTemplate,
      // email: {
      //   "ui:widget": "ReadOnlyWidget",
      // },
      // phone_number: {
      //   "ui:widget": "ReadOnlyWidget",
      // },
    },
    section4: {
      "ui:FieldTemplate": SectionFieldTemplate,
      // street_address: {
      //   "ui:widget": "ReadOnlyWidget",
      // },
      // municipality: {
      //   "ui:widget": "ReadOnlyWidget",
      // },
      // province: {
      //   "ui:widget": "ReadOnlyWidget",
      // },
      // postal_code: {
      //   "ui:widget": "ReadOnlyWidget",
      // },
    },
  },
};

export const createContactDetailsProperties = (contactFormData: {
  first_name: any;
  last_name: any;
  position_title: any;
  email: any;
  phone_number: any;
  street_address: any;
  municipality: any;
  province: any;
  postal_code: any;
}) => {
  return {
    type: "object", // Define the type of contact_details

    properties: {
      section1: {
        type: "object",
        title: "Personal Information",
        properties: {
          first_name: {
            type: "string",
            title: "First Name",
            default: contactFormData.first_name,
          },
          last_name: {
            type: "string",
            title: "Last Name",
            default: contactFormData.last_name,
          },
        },
      },
      section2: {
        type: "object",
        title: "Work Information",
        properties: {
          position_title: {
            type: "string",
            title: "Job Title / Position",
            default: contactFormData.position_title,
          },
        },
      },
      section3: {
        type: "object",
        title: "Contact Information",
        properties: {
          email: {
            type: "string",
            title: "Business Email Address",
            default: contactFormData.email,
          },
          phone_number: {
            type: "string",
            title: "Business Telephone Number",
            default: contactFormData.phone_number,
          },
        },
      },
      section4: {
        type: "object",
        title: "Address Information",
        properties: {
          street_address: {
            type: "string",
            title: "Business Mailing Address",
            default: contactFormData.street_address || "",
          },
          municipality: {
            type: "string",
            title: "Municipality",
            default: contactFormData.municipality || "",
          },
          province: {
            type: "string",
            title: "Province",
            default: contactFormData.province || "",
          },
          postal_code: {
            type: "string",
            title: "Postal Code",
            default: contactFormData.postal_code || "",
          },
        },
      },
    },
  };
};
