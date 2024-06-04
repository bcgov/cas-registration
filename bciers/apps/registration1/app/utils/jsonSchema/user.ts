import { RJSFSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";

export const userSchema: RJSFSchema = {
  type: "object",
  required: ["first_name", "last_name", "phone_number", "position_title"],
  properties: {
    first_name: { type: "string", title: "First Name" },
    last_name: { type: "string", title: "Last Name" },
    phone_number: {
      type: "string",
      title: "Phone Number",
      format: "phone",
    },
    email: {
      type: "string",
      title: "Email Address",
      readOnly: true,
    },
    position_title: { type: "string", title: "Position Title" },
  },
};

export const userUiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  phone_number: {
    "ui:widget": "PhoneWidget",
  },
};
