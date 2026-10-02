import type { RJSFSchema } from "@rjsf/utils";

export const accountSchema: RJSFSchema = {
  type: "object",
  properties: {
    id: { type: "integer", title: "Account ID" },
    name: { type: "string", title: "Account name" },
    account_type: { type: "string", title: "Account Type" },
    account_classification: {
      type: "string",
      title: "Classification",
    },
    website: { type: ["string", "null"], title: "Website" },
    issued_quantity: { type: "number", title: "Issued units" },
    active_quantity: { type: "number", title: "Active units" },
    retired_quantity: { type: "number", title: "Retired units" }
  },
};