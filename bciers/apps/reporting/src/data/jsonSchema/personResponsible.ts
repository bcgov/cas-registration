import { TitleOnlyFieldTemplate } from "@bciers/components/form/fields";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import {
  infoNote,
  SyncContactsButton,
} from "@reporting/src/data/jsonSchema/personResponsibleInfoText";
import SectionFieldTemplate from "@bciers/components/form/fields/SectionFieldTemplate";
import { Contact } from "@reporting/src/app/components/operations/types";

export const personResponsibleSchema: RJSFSchema = {
  title: "Person Responsible for Submitting Report",
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
    sync_button: {
      type: "object",
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
    "sync_button",
  ],
  purpose_note: {
    "ui:FieldTemplate": TitleOnlyFieldTemplate,
    "ui:title": infoNote,
  },
  assign_info: {
    "ui:FieldTemplate": SectionFieldTemplate,
  },
  sync_button: {
    "ui:FieldTemplate": SyncContactsButton,
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
      first_name: {
        "ui:disabled": true,
      },
      last_name: {
        "ui:disabled": true,
      },
    },
    section2: {
      "ui:FieldTemplate": SectionFieldTemplate,
      position_title: {
        "ui:disabled": true,
      },
    },
    section3: {
      "ui:FieldTemplate": SectionFieldTemplate,
      email: {
        "ui:disabled": true,
      },
      phone_number: {
        "ui:disabled": true,
      },
    },
    section4: {
      "ui:FieldTemplate": SectionFieldTemplate,
      street_address: {
        "ui:disabled": true,
      },
      municipality: {
        "ui:disabled": true,
      },
      province: {
        "ui:disabled": true,
      },
      postal_code: {
        "ui:disabled": true,
      },
    },
  },
};

export const createContactDetailsProperties = (userContact: Contact) => {
  return {
    type: "object",
    properties: {
      section1: {
        type: "object",
        title: "Personal Information",
        properties: {
          first_name: {
            type: "string",
            title: "First Name",
            default: userContact.first_name,
          },
          last_name: {
            type: "string",
            title: "Last Name",
            default: userContact.last_name,
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
            default: userContact.position_title,
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
            default: userContact.email,
          },
          phone_number: {
            type: "string",
            title: "Business Telephone Number",
            default: userContact.phone_number,
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
            default: userContact.street_address || "",
          },
          municipality: {
            type: "string",
            title: "Municipality",
            default: userContact.municipality || "",
          },
          province: {
            type: "string",
            title: "Province",
            default: userContact.province || "",
          },
          postal_code: {
            type: "string",
            title: "Postal Code",
            default: userContact.postal_code || "",
          },
        },
      },
    },
  };
};
