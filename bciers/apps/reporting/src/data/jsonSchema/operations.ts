import { RJSFSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import { TitleOnlyFieldTemplate } from "@bciers/components/form/fields";
import { purposeNote } from "./reviewOperationInformationText";
const commonUiOptions = { style: { width: "100%", textAlign: "left" } };

export const operationReviewSchema: RJSFSchema = {
  type: "object",
  title: "Review operation information",
  required: [
    "operation_representative_name",
    "operation_bcghgid",
    "regulated_products",
  ],

  properties: {
    purpose_note: {
      type: "object",
      readOnly: true,
    },
    operation_report_type: {
      type: "string",
      title: "Please select what type of report are you filling",
      enum: [
        "Annual emissions report",
        "Regulated partial year operation",
        "Simple Report",
      ],
    },
    operation_representative_name: {
      type: "string",
      title: "Operation representative",
    },

    date_info: {
      type: "object",
      readOnly: true,
    },

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
  },
};

export const operationReviewUiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  operator_legal_name: {
    "ui:options": commonUiOptions,
  },
  operator_trade_name: {
    "ui:options": commonUiOptions,
  },
  operation_name: {
    "ui:options": commonUiOptions,
  },
  purpose_note: {
    "ui:FieldTemplate": TitleOnlyFieldTemplate,
    "ui:title": purposeNote,
  },

  date_info: {
    "ui:FieldTemplate": TitleOnlyFieldTemplate,
    "ui:options": {
      style: { variant: "body2", color: "#38598A", fontSize: "16px" },
    },
  },
  operation_type: {
    "ui:widget": "select",
    "ui:options": commonUiOptions,
    "ui:placeholder": "Operation type",
  },
  operation_report_type: {
    "ui:widget": "select",
    "ui:options": { style: { width: "100%", textAlign: "justify" } },
    "ui:placeholder": "Report type",
  },
  operation_bcghgid: {
    "ui:options": commonUiOptions,
    "ui:placeholder": "BCGHG ID",
  },
  bc_obps_regulated_operation_id: {
    "ui:options": commonUiOptions,
    "ui:placeholder": "BORO ID",
  },
  reporting_activities: {
    "ui:widget": "MultiSelectWidget",
    "ui:options": commonUiOptions,
    "ui:placeholder": "Reporting activities",
  },
  regulated_products: {
    "ui:widget": "MultiSelectWidget",
    "ui:options": {
      ...commonUiOptions,
      label: { style: { verticalAlign: "top" } },
    },
    "ui:placeholder": "Regulated products",
  },
  operation_representative_name: {
    "ui:widget": "select",
    "ui:options": commonUiOptions,
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
