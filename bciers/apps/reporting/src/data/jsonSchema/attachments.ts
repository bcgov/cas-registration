import {
  FieldTemplate,
  TitleOnlyFieldTemplate,
} from "@bciers/components/form/fields";
import { RJSFSchema, UiSchema } from "@rjsf/utils";

export const jsonSchema: RJSFSchema = {
  type: "object",
  title: "Attachments",
  properties: {
    please_statement: {
      type: "string",
      title:
        "Please upload any of the documents below that is applicable to your report:",
    },
    verification_statement: {
      type: "string",
      title: "Verification statement",
      format: "data-url",
    },
    wci_352_362: {
      type: "string",
      title: "WCI.352 and WCI.362",
      format: "data-url",
    },
    additional_reportable_information: {
      type: "string",
      title: "Additional reportable information",
      format: "data-url",
    },
    confidentiality_request: {
      type: "string",
      title:
        "Confidentiality request, if you are requesting confidentiality of this report under the B.C. Reg 249/2015 Reporting Regulation",
      format: "data-url",
    },
  },
};

export const uiSchema: UiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  please_statement: {
    "ui:FieldTemplate": TitleOnlyFieldTemplate,
    "ui:classNames": "mt-2 mb-5",
  },
  verification_statement: {
    "ui:widget": "FileWidget",
    "ui:options": {
      accept: ".pdf",
      label: "ver. stmt.",
    },
  },
  wci_352_362: {
    "ui:widget": "FileWidget",
    "ui:options": {
      accept: ".pdf",
      label: "wci",
    },
  },
  additional_reportable_information: {
    "ui:widget": "FileWidget",
    "ui:options": {
      accept: ".pdf",
      label: "add. rep. info.",
    },
  },
  confidentiality_request: {
    "ui:widget": "FileWidget",
    "ui:options": {
      accept: ".pdf",
      label: "conf. req.",
    },
  },
};
