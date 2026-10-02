import type { RJSFSchema } from "@rjsf/utils";

export const projectSchema: RJSFSchema = {
  type: "object",
  properties: {
    id: { type: "integer", title: "Project ID" },
    name: { type: "string", title: "Project name" },
    account_name: { type: "string", title: "Account Name" },
    operation_name: { type: "string", title: "Operation Name" },
    project_type: { type: "string", title: "Project Type" },
    category: { type: "string", title: "Category" },
    verifier_name: { type: "string", title: "Verifier Name" },
    status: { type: "string", title: "Status" },
    issued_quantity: { type: "number", title: "Issued units" },
    active_quantity: { type: "number", title: "Active units" },
    retired_quantity: { type: "number", title: "Retired units" }
  },
};