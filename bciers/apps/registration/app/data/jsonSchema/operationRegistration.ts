import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import SectionFieldTemplate from "@bciers/components/form/fields/SectionFieldTemplate";
import { RJSFSchema } from "@rjsf/utils";
import { facilitiesSchemaSfo } from "apps/administration/app/data/jsonSchema/facilitiesSfo";

const registrationPurpose: RJSFSchema = {
  title: "Registration Purpose",
  type: "object",
  properties: {
    name: {
      type: "string",
      title: "Name",
    },
  },
};

const operationInformation: RJSFSchema = {
  title: "Operation Information",
  type: "object",
  properties: {
    name: {
      type: "string",
      title: "Name",
    },
  },
};

const facilityInformation: RJSFSchema = {
  title: "Facility Information",
  type: "object",
  properties: {
    facility_information_array: {
      type: "array",
      title: "Facility Information",
      items: {
        type: "object",
        properties: {
          // This is just a placeholder, the actual schema has a bunch of conditionals
          // based on sfo/lfo
          ...facilitiesSchemaSfo.properties,
        },
      },
    },
  },
};

const operationRepresentative: RJSFSchema = {
  title: "Operation Representative",
  type: "object",
  properties: {
    name: {
      type: "string",
      title: "Name",
    },
  },
};

const submission: RJSFSchema = {
  title: "Submission",
  type: "object",
  properties: {
    // I didn't know what to name these if someone wants to come up with something better
    acknowledgement_of_review: {
      title:
        "I certify that I have reviewed the registration, and that I have exercised due diligence to ensure that the information included in the registration is true and complete.",
      type: "boolean",
      default: false,
    },
    acknowledgement_of_records: {
      title:
        "I understand that the Ministry responsible for the administration and enforcement of the Greenhouse Gas Industrial Reporting and Control Act may require records from the Operator evidencing the truth of this registration.",
      type: "boolean",
      default: false,
    },
    acknowledgement_of_information: {
      title:
        "I understand that this information is being collected for the purpose of registration of the operation under Greenhouse Gas Industrial Reporting and Control Act and may be disclosed to the Ministry responsible for the administration and enforcement of the Carbon Tax Act.",
      type: "boolean",
      default: false,
    },
  },
};

export const operationRegistrationSchema: RJSFSchema = {
  title: "Operation Registration",
  type: "object",
  properties: {
    section1: registrationPurpose,
    section2: operationInformation,
    section3: facilityInformation,
    section4: operationRepresentative,
    submission,
  },
};

export const operationRegistrationUiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",

  facility_information_array: {
    "ui:FieldTemplate": FieldTemplate,
    "ui:options": {
      label: false,
      arrayAddLabel: "Add facility",
      title: "Facility",
    },
    items: {
      section1: {
        "ui:FieldTemplate": SectionFieldTemplate,
      },
      section2: {
        "ui:FieldTemplate": SectionFieldTemplate,
      },
    },
  },
  acknowledgement_of_review: {
    "ui:widget": "checkbox",
    "ui:options": {
      label: false,
    },
  },
  acknowledgement_of_records: {
    "ui:widget": "checkbox",
    "ui:options": {
      label: false,
    },
  },
  acknowledgement_of_information: {
    "ui:widget": "checkbox",
    "ui:options": {
      label: false,
    },
  },
};
