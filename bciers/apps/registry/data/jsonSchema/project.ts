import type { RJSFSchema } from "@rjsf/utils";

export const projectSchema: RJSFSchema = {
  type: "object",
  properties: {
    id: { type: "integer", title: "Project ID" },
    name: { type: "string", title: "Project name" },
    account_id: { type: "integer", title: "Account Name" },
    project_type: { type: "string", title: "Project Type" },
    category: { type: "string", title: "Category" },
    verifier_id: { type: "string", title: "Verifier ID" },
    status: { type: "string", title: "Status" },
    issued_units: { type: "number", title: "Issued units" },
    active_units: { type: "number", title: "Active units" },
    retired_units: { type: "number", title: "Retired units" }
  },
};