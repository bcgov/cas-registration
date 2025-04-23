import { RJSFSchema } from "@rjsf/utils";
import {
  FieldTemplate,
  TitleOnlyFieldTemplate,
} from "@bciers/components/form/fields";
import BasicFieldTemplate from "@bciers/components/form/fields/BasicFieldTemplate";
import { ReportingFlow } from "@reporting/src/app/components/taskList/types";

const baseFields = (flow: string): RJSFSchema["properties"] => ({
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
  signature: {
    type: "string",
    format: "signature",
    title: "Please add your signature by typing your name here:",
  },
  date: {
    type: "string",
    title: "Date signed",
  },
  ...(flow === ReportingFlow.EIO
    ? {
        acknowledgement_of_errors: {
          title:
            "I understand that any errors, omissions, or misstatements provided in this report can lead to administrative penalties.",
          type: "boolean",
          default: false,
        },
      }
    : {
        acknowledgement_of_information: {
          title:
            "I understand that this information is being collected for the purpose of emission reporting under the Greenhouse Gas Industrial Reporting and Control Act and may be disclosed to the Ministry responsible for the administration and enforcement of the Carbon Tax Act.",
          type: "boolean",
          default: false,
        },
      }),
});

const getSupplementaryFields = (
  isRegulated: boolean,
): RJSFSchema["properties"] => ({
  editing_note: {
    title:
      "By editing the original submission, please confirm that you understand the following:",
    type: "string",
  },
  acknowledgement_of_new_version: {
    title:
      "I understand that, by submitting these changes, I am creating a new version of this annual report that will, effective immediately, be the annual report for the reporting and/or compliance period that it pertains to.",
    type: "boolean",
    default: false,
  },
  ...(isRegulated && {
    acknowledgement_of_corrections: {
      title:
        "I understand that the correction of any errors, omissions, or misstatements in the new submission of this report may lead to an additional compliance obligation, and, if submitted after the compliance obligation deadline, applicable interest.",
      type: "boolean",
      default: false,
    },
  }),
});

export const buildSignOffSchema = (
  isSupplementary: boolean,
  isRegulated: boolean,
  flow: string,
): RJSFSchema => {
  const properties: RJSFSchema["properties"] = {
    ...baseFields(flow),
  };

  if (isSupplementary) {
    properties.supplementary = {
      type: "object",
      properties: getSupplementaryFields(isRegulated),
    };
  } else if (flow !== ReportingFlow.EIO) {
    properties.acknowledgement_of_possible_costs = {
      title:
        "I understand that the information provided in this report will impact the compliance obligation of this operation and that any errors, omissions, or misstatements can lead to an additional compliance obligation or administrative penalties.",
      type: "boolean",
      default: false,
    };
  }

  return {
    title: "Sign-off",
    type: "object",
    properties,
  };
};
export const signOffUiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  "ui:order": [
    "submission_note",
    "acknowledgement_of_review",
    "acknowledgement_of_records",
    "acknowledgement_of_information",
    "acknowledgement_of_errors",
    "acknowledgement_of_possible_costs",
    "supplementary",
    "signature",
    "date",
  ],
  submission_note: {
    "ui:FieldTemplate": TitleOnlyFieldTemplate,
    "ui:classNames": "mt-2 mb-5",
  },
  acknowledgement_of_review: {
    "ui:FieldTemplate": BasicFieldTemplate,
    "ui:widget": "CheckboxWidget",
    "ui:options": {
      alignment: "top",
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
  acknowledgement_of_errors: {
    "ui:FieldTemplate": BasicFieldTemplate,
    "ui:widget": "CheckboxWidget",
    "ui:options": {
      alignment: "top",
    },
  },
  acknowledgement_of_possible_costs: {
    "ui:FieldTemplate": BasicFieldTemplate,
    "ui:widget": "CheckboxWidget",
    "ui:options": {
      alignment: "top",
    },
  },
  supplementary: {
    "ui:FieldTemplate": BasicFieldTemplate,
    "ui:options": {
      style: {
        background: "#F2F2F2",
        label: "",
        marginBottom: "20px",
        padding: "16px",
      },
      label: false,
    },
    editing_note: {
      "ui:FieldTemplate": TitleOnlyFieldTemplate,
      "ui:classNames": "mt-2 mb-5",
    },
    acknowledgement_of_new_version: {
      "ui:FieldTemplate": BasicFieldTemplate,
      "ui:widget": "CheckboxWidget",
      "ui:options": {
        alignment: "top",
      },
    },
    acknowledgement_of_corrections: {
      "ui:FieldTemplate": BasicFieldTemplate,
      "ui:widget": "CheckboxWidget",
      "ui:options": {
        alignment: "top",
      },
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
