import { RJSFSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";

export const operationReviewSchema: RJSFSchema = {
  type: "object",
  properties: {
    operatorLegalName: { type: "string", title: "Operator legal name" },
    operatorTradeName: { type: "string", title: "Operator trade name" },
    operationName: { type: "string", title: "Operation name" },
    operationType: {
      type: "string",
      title: "Operation type",
      enum: ["Linear facility operation"],
    },
    BCGHGID: { type: "string", title: "BCGHG ID" },
    BOROID: { type: "string", title: "BORO ID" },
    reportingActivities: {
      type: "array",
      title: "Reporting activities",
      items: { type: "string" },
      uniqueItems: true,
    },
    regulatedProducts: {
      type: "array",
      title: "Regulated products",
      items: { type: "string" },
      uniqueItems: true,
    },
    operationRepresentative: {
      type: "string",
      title: "Operation representative",
      enum: ["sam smith", "belinda g"],
    },
  },
};

export const operationReviewUiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  operatorLegalName: {
    "ui:options": { style: { width: "100%", textAlign: "left" } },
  },
  operatorTradeName: {
    "ui:options": { style: { width: "100%", textAlign: "left" } },
  },
  operationName: {
    "ui:options": { style: { width: "100%", textAlign: "left" } },
  },
  operationType: {
    "ui:widget": "select",
    "ui:options": { style: { width: "100%", textAlign: "left" } },
  },
  BCGHGID: { "ui:options": { style: { width: "100%", textAlign: "left" } } },
  BOROID: { "ui:options": { style: { width: "100%", textAlign: "left" } } },
  reportingActivities: {
    "ui:widget": "select",
    "ui:options": { style: { width: "100%", textAlign: "left" } },
  },
  regulatedProducts: {
    "ui:widget": "select",
    "ui:options": { style: { width: "100%", textAlign: "left" } },
  },
  operationRepresentative: {
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
