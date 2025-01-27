import { RJSFSchema } from "@rjsf/utils";

export const eioInformationSchema: RJSFSchema = {
  title: "Operation Information",
  type: "object",
  required: ["name", "type"],
  properties: {
    name: { type: "string", title: "Operation Name" },
    type: {
      type: "string",
      title: "Operation Type",
      enum: [
        "Single Facility Operation",
        "Linear Facility Operation",
        "Electricity Import Operation",
      ],
      default: "Electricity Import Operation",
    },
  },
};
