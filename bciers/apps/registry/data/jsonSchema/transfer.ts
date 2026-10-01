import type { RJSFSchema } from "@rjsf/utils";

export const transferSchema: RJSFSchema = {
  type: "object",
  properties: {
    initiated_datetime: {
      type: "string",
      format: "date-time",
      title: "Initiated",
    },
    source_account_name: { type: "string", title: "Source account" },
    destination_account_name: { type: "string", title: "Destination account" },
    transfer_quantity: { type: "integer", title: "Transfer qty" },
    status: { type: "string", title: "Status" },
  },
};