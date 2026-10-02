import type { RJSFSchema } from "@rjsf/utils";

export const issuanceSchema: RJSFSchema = {
  type: "object",
  properties: {
    account_name: { type: "string", title: "Account name" },
    project_name: { type: "string", title: "Project name" },
    project_type: { type: "string", title: "Project type" },
    operation_name: { type: "string", title: "Operation" },
    vintage_year: { type: "string", title: "Vintage year" },
    issuance_year: { type: "integer", title: "Issuance year" },
    serial_number: { type: "string", title: "Serial number" },
    verifier_name: { type: "string", title: "Verifier" },
    unit_quantity: { type: "integer", title: "Units" },
    status: { type: "string", title: "Status" },
    unit_class: { type: "string", title: "Class" },
    project_id: { type: "integer", title: "Project details" }
  },
};