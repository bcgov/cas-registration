import { RJSFSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import { TitleOnlyFieldTemplate } from "@bciers/components/form/fields";
import { purposeNote } from "./reviewOperationInformationText";
import { BC_GOV_BACKGROUND_COLOR_BLUE } from "@bciers/styles";
import selectWidget from "@bciers/components/form/widgets/SelectWidget";
const commonUiOptions = { style: { width: "100%", textAlign: "left" } };

export const operationReviewSchema: RJSFSchema = {
  type: "object",
  title: "Review operation information",
  required: [
    "operation_representative_name",
    "operation_bcghgid",
    "operation_name",
  ],

  properties: {
    purpose_note: {
      type: "object",
      readOnly: true,
    },
    operation_report_type: {
      type: "string",
      title:
        "Select what type of report you are filling. If you are uncertain about which report type your operation should complete, please contact GHGRegulator@gov.bc.ca.",
      enum: ["Annual report", "Simple Report"],
      default: "Annual report",
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
    registration_purpose: {
      type: "string",
      title: "Registration Purpose",
    },
    operation_bcghgid: { type: "string", title: "BCGHG ID" },
    bc_obps_regulated_operation_id: { type: "string", title: "BORO ID" },
  },
  dependencies: {
    operation_report_type: {
      oneOf: [
        {
          enum: ["Annual Report"],
          properties: {
            activities: {
              type: "array",
              title: "Reporting activities",
              minItems: 1,
            },
            regulated_products: {
              type: "array",
              title: "Regulated products",
              minItems: 1,
            },
          },
          required: ["regulated_products", "activities"],
        },
      ],
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
      style: {
        variant: "body2",
        color: BC_GOV_BACKGROUND_COLOR_BLUE,
        fontSize: "16px",
      },
    },
  },
  operation_type: {
    "ui:options": commonUiOptions,
    "ui:placeholder": "Operation type",
    "ui:disabled": true,
  },
  operation_report_type: {
    "ui:widget": selectWidget,
    "ui:placeholder": "Report type",
    "ui:disabled": true,
  },
  registration_purpose: {
    "ui:placeholder": "Registration Purpose",
    "ui:disabled": true,
  },
  operation_bcghgid: {
    "ui:options": commonUiOptions,
    "ui:placeholder": "BCGHG ID",
    "ui:disabled": true,
  },
  bc_obps_regulated_operation_id: {
    "ui:options": commonUiOptions,
    "ui:placeholder": "BORO ID",
    "ui:disabled": true,
  },

  activities: {
    "ui:widget": "MultiSelectWidget",
    "ui:options": {
      ...commonUiOptions,
      label: { style: { verticalAlign: "top" } },
    },
    "ui:placeholder": "Reporting activities",
    uniqueItems: true,
  },
  regulated_products: {
    "ui:widget": "MultiSelectWidget",
    "ui:options": {
      ...commonUiOptions,
      label: { style: { verticalAlign: "top" } },
    },
    "ui:placeholder": "Regulated products",
    uniqueItems: true,
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
        backgroundColor: BC_GOV_BACKGROUND_COLOR_BLUE,
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

export const updateSchema = (
  prevSchema: RJSFSchema,
  formDataState: any,
  registrationPurpose: string,
  reportingWindowEnd: string,
  allActivities: any[],
  allRegulatedProducts: any[],
) => {
  return {
    ...prevSchema,
    properties: {
      ...prevSchema.properties,
      operation_report_type: {
        type: "string",
        title:
          "Select what type of report you are filling. If you are uncertain about which report type your operation should complete, please contact GHGRegulator@gov.bc.ca.",
        enum: ["Annual Report", "Simple Report"],
        default: formDataState?.operation_report_type || "Annual Report",
      },
      operation_representative_name: {
        type: "string",
        title: "Operation representative",
        enum: [formDataState.operation_representative_name || ""],
      },
      operation_type: {
        type: "string",
        title: "Operation type",
        default: [formDataState.operation_type || ""],
      },
      registration_purpose: {
        type: "string",
        title: "Registration Purpose",
        default: registrationPurpose || "",
      },
      date_info: {
        type: "object",
        readOnly: true,
        title: `Please ensure this information was accurate for ${reportingWindowEnd}`,
      },
    },
    dependencies: {
      operation_report_type: {
        oneOf: [
          {
            properties: {
              operation_report_type: {
                enum: ["Annual Report"],
              },
              activities: {
                type: "array",
                title: "Reporting activities",
                minItems: 1,
                items: {
                  type: "number",
                  enum: allActivities.map((activity) => activity.id),
                  enumNames: allActivities.map((activity) => activity.name),
                },
              },
              regulated_products: {
                type: "array",
                title: "Regulated products",
                minItems: 1,
                items: {
                  type: "number",
                  enum: allRegulatedProducts.map((product) => product.id),
                  enumNames: allRegulatedProducts.map(
                    (product) => product.name,
                  ),
                },
              },
            },
          },
        ],
      },
    },
  };
};
