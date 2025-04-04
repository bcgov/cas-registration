import { RJSFSchema } from "@rjsf/utils";

export const newEntrantSchema: RJSFSchema = {
  type: "object",
  title: "New Entrant Information",
  required: [
    "authorization_date",
    "first_shipment_date",
    "new_entrant_period_start",
  ],
  properties: {
    purpose_note: {
      type: "object",
      readOnly: true,
    },
    authorization_date: {
      type: "string",
      title: "Authorization Date",
    },
    first_shipment_date: {
      type: "string",
      title: "Date of first shipment",
    },
    new_entrant_period_start: {
      type: "string",
      title: "Date new entrant period began",
    },
    assertion_statement: {
      type: "boolean",
      title: "Assertion statement",
      default: false,
    },
    products: {
      type: "array",
      items: {
        $ref: "#/definitions/newEntrantProduction",
      },
    },
    emissions: {
      type: "array",
      items: {
        $ref: "#/definitions/emissionCategoryType",
      },
    },
  },
  definitions: {
    newEntrantProduction: {
      properties: {
        id: {
          type: "integer",
          title: "Product ID",
        },
        name: {
          type: "string",
          title: "Product Name",
        },
        unit: {
          type: "string",
          title: "Unit",
        },
        production_amount: {
          type: "string",
          title: "Production after new entrant period began",
        },
      },
    },
    emissionCategoryType: {
      properties: {
        title: {
          type: "string",
        },
        emissionData: {
          type: "array",
          items: {
            $ref: "#/definitions/emissionData",
          },
        },
      },
    },
    emissionData: {
      properties: {
        id: {
          type: "number",
          minimum: 0,
        },
        name: {
          type: "string",
        },
        emission: {
          type: "string",
        },
      },
    },
  },
};
