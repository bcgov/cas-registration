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
};
