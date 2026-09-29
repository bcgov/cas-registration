import type { RJSFSchema } from "@rjsf/utils";

export const transferSchema: RJSFSchema = {
  type: "object",
  properties: {
    id: { type: "integer", title: "Transfer ID" },
    initiated_datetime: {
      type: "string",
      format: "date-time",
      title: "Initiated",
    },
    completed_datetime: {
      type: ["string", "null"],
      format: "date-time",
      title: "Completed",
    },
    source_account_id: { type: "integer", title: "From Account" },
    destination_account_id: { type: "integer", title: "To Account" },
    status: { type: "string", title: "Status" },
    comment: { type: ["string", "null"], title: "Comment" },
    project_id: { type: "integer", title: "Project ID" },
    transfer_quantity: { type: "integer", title: "Quantity" },
    vintage: { type: ["string", "null"], title: "Vintage" },
    price_per_unit: {
      type: ["number", "null"],
      title: "Price Per Unit",
    },
    measurement: { type: ["string", "null"], title: "Measurement" },
    unit_type: { type: "string", title: "Unit Type" },
    unit_id: { type: ["string", "null"], title: "Unit ID" },
    requested_by_id: { type: "string", title: "Requested By" },
    reviewed_by_id: {
      type: ["string", "null"],
      title: "Reviewed By",
    },
  },
};