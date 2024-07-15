import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import { RJSFSchema } from "@rjsf/utils";

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
    age: {
      type: "number",
      title: "Age",
    },
  },
};

const facilityInformation: RJSFSchema = {
  title: "Facility Information",
  type: "object",
  properties: {
    age: {
      type: "number",
      title: "Age",
    },
  },
};

const operationRepresentative: RJSFSchema = {
  title: "Operation Representative",
  type: "object",
  properties: {
    age: {
      type: "number",
      title: "Age",
    },
  },
};

export const operationRegistrationSchema: RJSFSchema = {
  title: "Operation Registration",
  type: "object",
  properties: {
    page1: registrationPurpose,
    page2: operationInformation,
    page3: facilityInformation,
    page4: operationRepresentative,
  },
};

export const operationRegistrationUiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
};
