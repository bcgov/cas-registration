import { TitleOnlyFieldTemplate } from "@bciers/components/form/fields";
import BasicFieldTemplate from "@bciers/components/form/fields/BasicFieldTemplate";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import { RJSFSchema, UiSchema } from "@rjsf/utils";

export const submissionSchema: RJSFSchema = {
  title: "Submission",
  type: "object",
  required: [
    "acknowledgement_of_review",
    "acknowledgement_of_records",
    "acknowledgement_of_information",
  ],
  properties: {
    submission_note: {
      title:
        "Before clicking 'Submit', please confirm that you understand and agree with the following statements:",
      type: "string",
    },
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

export const submissionUiSchema: UiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  submission_note: {
    "ui:FieldTemplate": TitleOnlyFieldTemplate,
    "ui:classNames": "mt-2 mb-5",
  },
  acknowledgement_of_review: {
    "ui:FieldTemplate": BasicFieldTemplate,
    "ui:widget": "CheckboxWidget",
  },
  acknowledgement_of_records: {
    "ui:FieldTemplate": BasicFieldTemplate,
    "ui:widget": "CheckboxWidget",
  },
  acknowledgement_of_information: {
    "ui:FieldTemplate": BasicFieldTemplate,
    "ui:widget": "CheckboxWidget",
  },
};
