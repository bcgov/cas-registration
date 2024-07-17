import { RJSFSchema } from "@rjsf/utils";

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
  operationType: { "ui:widget": "select" },
  reportingActivities: { "ui:widget": "select" },
  regulatedProducts: { "ui:widget": "select" },
  operationRepresentative: { "ui:widget": "select" },
  "ui:submitButtonOptions": {
    props: {
      className:
        "MuiButtonBase-root MuiButton-root MuiButton-contained MuiButton-containedPrimary",
      style: {
        backgroundColor: "#38598A", // Adjust this to match your exact blue color
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
