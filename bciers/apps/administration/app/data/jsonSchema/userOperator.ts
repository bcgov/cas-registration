import { RJSFSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";

export const userOperatorAdministrationSchema: RJSFSchema = {
  type: "object",
  title: "Admin Information",
  properties: {
    first_name: {
      type: "string",
      title: "First Name",
    },
    last_name: {
      type: "string",
      title: "Last Name",
    },
    bceid_business_name: {
      type: "string",
      title: "BCeID Business Name",
    },
    position_title: {
      type: "string",
      title: "Position Title",
    },
    email: {
      type: "string",
      title: "Email Address",
      format: "email",
      readOnly: true,
    },
    phone_number: {
      type: "string",
      title: "Phone Number",
      format: "phone",
      readOnly: true,
    },
  },
};

export const userOperatorAdministrationUiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  email: {
    "ui:widget": "EmailWidget",
  },
  province: {
    "ui:widget": "ComboBox",
    "ui:placeholder": "Select a province",
  },
  // Remove headings since titles are displayed in Accordion header
  "ui:options": {
    label: false,
  },
};
