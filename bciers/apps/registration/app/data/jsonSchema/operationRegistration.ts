import BasicFieldTemplate from "@bciers/components/form/fields/BasicFieldTemplate";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import {
  facilitiesSchemaSfo,
  facilitiesUiSchema,
} from "apps/administration/app/data/jsonSchema/facilitiesSfo";

const registrationPurpose: RJSFSchema = {
  title: "Registration Purpose",
  type: "object",
  properties: {
    registration_purpose: {
      type: "string",
      title: "The purpose of this registration is to register as a:",
      enum: [
        "Reporting Operation",
        "OBPS Regulated Operation",
        "Opted-in Operation",
        "New Entrant Operation",
        "Electricity Import Operation",
        "Potential Reporting Operation",
      ],
    },
  },
  dependencies: {
    registration_purpose: {
      allOf: [
        {
          if: {
            properties: {
              registration_purpose: {
                const: "OBPS Regulated Operation",
              },
            },
          },
          then: {
            properties: {
              regulated_products: {
                type: "array",
                items: {
                  type: "number",
                },
                title: "Reporting Operation",
              },
            },
          },
        },
      ],
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

const newEntrantOperation: RJSFSchema = {
  title: "New Entrant Operation",
  type: "object",
  properties: {
    new_entrant_operation: {
      type: "string",
      title: "New Entrant Operation",
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
    registrationPurpose,
    operationInformation,
    facilityInformation,
    operationRepresentative,
    submission,
  },
};

export const operationRegistrationNewEntrantSchema: RJSFSchema = {
  title: "Operation Registration",
  type: "object",
  properties: {
    registrationPurpose,
    operationInformation,
    facilityInformation,
    newEntrantOperation,
    operationRepresentative,
    submission,
  },
};

export const operationRegistrationUiSchema: UiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  registration_purpose: {
    "ui:placeholder": "Select Registration Purpose",
  },
  regulated_products: {
    "ui:widget": "MultiSelectWidget",
    "ui:placeholder": "Select Regulated Product",
  },
  facility_information_array: {
    "ui:FieldTemplate": FieldTemplate,
    "ui:options": {
      label: false,
      arrayAddLabel: "Add facility",
      title: "Facility",
    },
    items: {
      ...facilitiesUiSchema,
    },
  },
  acknowledgement_of_review: {
    "ui:FieldTemplate": BasicFieldTemplate,
    "ui:widget": "checkbox",
  },
  acknowledgement_of_records: {
    "ui:FieldTemplate": BasicFieldTemplate,
    "ui:widget": "checkbox",
  },
  acknowledgement_of_information: {
    "ui:FieldTemplate": BasicFieldTemplate,
    "ui:widget": "checkbox",
  },
};
