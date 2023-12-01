import { RJSFSchema } from "@rjsf/utils";

export const userSchema: RJSFSchema = {
  type: "object",
  required: [
    "first_name",
    "last_name",
    "phone_number",
    "email",
    "position_title",
  ],
  properties: {
    first_name: { type: "string", title: "First Name" },
    last_name: { type: "string", title: "Last Name" },
    phone_number: { type: "string", title: "Phone Number" },
    email: { type: "string", title: "Email Address" },
    position_title: { type: "string", title: "Position Title" },
  },
};
