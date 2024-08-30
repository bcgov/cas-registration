import { RJSFSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
export const operationReviewSchema: RJSFSchema = {
  type: "object",
  required: [
    "operator_legal_name",
    "operator_trade_name",
    "operation_name",
    "operation_type",
    "operation_bcghgid",
    "operation_representative_name",
  ],
  properties: {
    operator_legal_name: { type: "string", title: "Operator legal name" },
    operator_trade_name: { type: "string", title: "Operator trade name" },
    operation_name: { type: "string", title: "Operation name" },
    operation_type: {
      type: "string",
      title: "Operation type",
    },
    operation_bcghgid: { type: "string", title: "BCGHG ID" },
    bc_obps_regulated_operation_id: { type: "string", title: "BORO ID" },
    reporting_activities: {
      type: "array",
      title: "Reporting activities",
      items: { type: "string" },
      uniqueItems: true,
    },
    regulated_products: {
      type: "array",
      title: "Regulated products",
      items: { type: "string" },
      uniqueItems: true,
    },
    operation_representative_name: {
      type: "string",
      title: "Operation representative",
    },
  },
};

export const operationReviewUiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  operator_legal_name: {
    "ui:options": { style: { width: "100%", textAlign: "left" } },
  },
  operator_trade_name: {
    "ui:options": { style: { width: "100%", textAlign: "left" } },
  },
  operation_name: {
    "ui:options": { style: { width: "100%", textAlign: "left" } },
  },
  operation_type: {
    "ui:widget": "select",
    "ui:options": { style: { width: "100%", textAlign: "left" } },
    "ui:placeholder": "Operation type",
  },
  operation_bcghgid: {
    "ui:options": { style: { width: "100%", textAlign: "left" } },
    "ui:placeholder": "BCGHG ID",
  },
  bc_obps_regulated_operation_id: {
    "ui:options": { style: { width: "100%", textAlign: "left" } },
    "ui:placeholder": "BORO ID",
  },
  reporting_activities: {
    "ui:widget": "MultiSelectWidget",
    "ui:options": { style: { width: "100%", textAlign: "left" } },
    "ui:placeholder": "Reporting activities",
  },
  regulated_products: {
    "ui:widget": "MultiSelectWidget",
    "ui:options": { style: { width: "100%", textAlign: "left" } },
    "ui:placeholder": "Regulated products",
  },
  operation_representative_name: {
    "ui:widget": "select",
    "ui:options": { style: { width: "100%", textAlign: "left" } },
  },
  "ui:submitButtonOptions": {
    props: {
      className:
        "MuiButtonBase-root MuiButton-root MuiButton-contained MuiButton-containedPrimary",
      style: {
        backgroundColor: "#38598A",
        color: "white",
        padding: "6px 16px",
        fontSize: "0.875rem",
        textTransform: "uppercase",
        boxShadow:
          "0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)",
        borderRadius: "4px",
      },
    },
    norender: false,
    submitText: "Save",
  },
};
