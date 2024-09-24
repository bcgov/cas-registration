import { RJSFSchema } from "@rjsf/utils";
import {
  FieldTemplate,
  TitleOnlyFieldTemplate,
} from "@bciers/components/form/fields";
import BasicFieldTemplate from "@bciers/components/form/fields/BasicFieldTemplate";

export const signOffSchema: RJSFSchema = {
  title: "Sign-off",
  type: "object",
  properties: {
    submission_note: {
      title:
        "Before clicking 'Submit', please confirm that you understand and agree with the following statements:",
      type: "string",
    },
    acknowledgement_of_review: {
      title:
        "I certify that I have reviewed the annual report, and that I have exercised due diligence to ensure that the information included in this report is true and complete.",
      type: "boolean",
      default: false,
    },
    acknowledgement_of_records: {
      title:
        "I understand that the Ministry responsible for the administration and enforcement of the Greenhouse Gas Industrial Reporting and Control Act may require records from the Operator evidencing the truth of this report.",
      type: "boolean",
      default: false,
    },
    acknowledgement_of_information: {
      title:
        "I understand that this information is being collected for the purpose of emission reporting under the Greenhouse Gas Industrial Reporting and Control Act and may be disclosed to the Ministry responsible for the administration and enforcement of the Carbon Tax Act.",
      type: "boolean",
      default: false,
    },
    acknowledgement_of_information2: {
      title:
        "I understand that the information provided in this report will impact the compliance obligation of this operation and that any errors, omissions, or misstatements can lead to an additional compliance obligation or administrative penalties.",
      type: "boolean",
      default: false,
    },

    signature: {
      type: "string",
      format: "signature",
      title: "Please add your signature by typing your name here:",
    },

    date: {
      type: "string",
      title: "Date signed",
    },
  },
};

export const signOffUiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  submission_note: {
    "ui:FieldTemplate": TitleOnlyFieldTemplate,
    "ui:classNames": "mt-2 mb-5",
  },
  acknowledgement_of_review: {
    "ui:FieldTemplate": BasicFieldTemplate,
    "ui:widget": "CheckboxWidget",
    "ui:options": {
      alignment: "top", // Align checkbox at the top
    },
  },
  acknowledgement_of_records: {
    "ui:FieldTemplate": BasicFieldTemplate,
    "ui:widget": "CheckboxWidget",
    "ui:options": {
      alignment: "top",
    },
  },
  acknowledgement_of_information: {
    "ui:FieldTemplate": BasicFieldTemplate,
    "ui:widget": "CheckboxWidget",
    "ui:options": {
      alignment: "top",
    },
  },
  acknowledgement_of_information2: {
    "ui:FieldTemplate": BasicFieldTemplate,
    "ui:widget": "CheckboxWidget",
    "ui:options": {
      alignment: "top",
    },
  },
  signature: {
    "ui:widget": "TextWidget",
    "ui:placeholder": "Enter your full name here",
  },

  date: {
    "ui:widget": "ReadOnlyWidget",
  },
};
