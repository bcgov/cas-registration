import type { RJSFSchema } from "@rjsf/utils";

export const projectSchema: RJSFSchema = {
  type: "object",
  properties: {
    id: { type: "integer", title: "Project ID" },
    name: { type: "string", title: "Name" },
    account_id: { type: "integer", title: "Account ID" },
    project_type: { type: "string", title: "Project Type" },
    category: { type: "string", title: "Category" },
    verifier_id: { type: "string", title: "Verifier ID" },
    address_id: { type: "integer", title: "Address ID" },
    project_start_date: {
      type: ["string", "null"],
      format: "date",
      title: "Start Date",
    },
    project_end_date: {
      type: ["string", "null"],
      format: "date",
      title: "End Date",
    },
    description: { type: ["string", "null"], title: "Description" },
    operation_id: { type: "string", title: "Operation ID" },
    status: { type: "string", title: "Status" },
    program_id: { type: "integer", title: "Program ID" },
    contact_id: { type: "integer", title: "Contact ID" },
  },
};