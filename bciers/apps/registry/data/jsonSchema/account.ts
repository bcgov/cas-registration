import type { RJSFSchema } from "@rjsf/utils";

export const accountSchema: RJSFSchema = {
  type: "object",
  properties: {
    id: { type: "integer", title: "Account ID" },
    parent_account_id: {
      type: ["integer", "null"],
      title: "Parent Account ID",
    },
    name: { type: "string", title: "Name" },
    operation_id: { type: "string", title: "Operation ID" },
    status: { type: "string", title: "Status" },
    website: { type: ["string", "null"], title: "Website" },
    account_type: { type: "string", title: "Account Type" },
    account_classification: {
      type: "string",
      title: "Classification",
    },
    address_id: { type: "integer", title: "Address ID" },
    primary_account_representative_id: {
      type: "integer",
      title: "Primary Representative ID",
    },
    program_id: { type: "integer", title: "Program ID" },
    type_of_account_holder: {
      type: "string",
      title: "Account Holder Type",
    },
  },
};