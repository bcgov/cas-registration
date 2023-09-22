import { RJSFSchema } from "@rjsf/utils";

export const operationSchema: RJSFSchema = {
  type: "object",
  required: [
    "id",
    "operator_id_id",
    "name",
    "operation_type",
    "naics_code_id",
    "eligible_commercial_product_name",
    "permit_id",
    "npr_id",
    "ghfrp_id",
    "bcghrp_id",
    "petrinex_id",
    "latitude",
    "longitude",
    "legal_land_description",
    "nearest_municipality",
    "operator_percent_of_ownership",
    "registered_for_obps",
    "estimated_emissions",
  ],
  properties: {
    id: { type: "number", title: "id" },
    operator_id_id: { type: "number", title: "operator_id_id" },
    name: { type: "string", title: "name" },
    operation_type: { type: "string", title: "operation_type" },
    naics_code_id: { type: "number", title: "naics_code_id" },
    eligible_commercial_product_name: {
      type: "string",
      title: "eligible_commercial_product_name",
    },
    permit_id: { type: "string", title: "permit_id" },
    npr_id: { type: "string", title: "npr_id" },
    ghfrp_id: { type: "string", title: "ghfrp_id" },
    bcghrp_id: { type: "string", title: "bcghrp_id" },
    petrinex_id: { type: "string", title: "petrinex_id" },
    latitude: { type: "number", title: "latitude" },
    longitude: { type: "number", title: "longitude" },
    legal_land_description: { type: "string", title: "legal_land_description" },
    nearest_municipality: { type: "string", title: "nearest_municipality" },
    operator_percent_of_ownership: {
      type: "number",
      title: "operator_percent_of_ownership",
    },
    registered_for_obps: { type: "boolean", title: "registered_for_obps" },
    // verified_at: { type: "string", title: "verified_at", format: "date" },
    // verified_by_id: { type: "string", title: "verified_by_id" },
    estimated_emissions: { type: "number", title: "estimated_emissions" },
    documents: { type: "string", title: "documents" },
    // contacts: { type: "string", title: "contacts" },
  },
};

export const operationUiSchema = {
  // operator_id_id: {
  //   "ui:widget": "hidden",
  // },
};
