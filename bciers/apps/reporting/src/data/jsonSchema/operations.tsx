import { RJSFSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import { TitleOnlyFieldTemplate } from "@bciers/components/form/fields";
import {
  purposeNote,
  reportTypeHelperText,
} from "./reviewOperationInformationText";
import { BC_GOV_BACKGROUND_COLOR_BLUE } from "@bciers/styles";
import selectWidget from "@bciers/components/form/widgets/SelectWidget";
import {
  ANNUAL_REPORT,
  SIMPLE_REPORT,
} from "@reporting/src/app/utils/constants";
const commonUiOptions = { style: { width: "100%", textAlign: "left" } };

export const buildOperationReviewSchema = (
  formDataState: any,
  reportingWindowEnd: string,
  allActivities: any[],
  allRegulatedProducts: any[],
  allRepresentatives: any[],
  reportType: string,
  showRegulatedProducts: boolean,
  showBoroId: boolean,
  showActivities: boolean,
) =>
  ({
    type: "object",
    title: "Review Operation Information",
    required: [
      "operation_representative_name",
      "operation_name",
      "operator_legal_name",
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
        enum: [ANNUAL_REPORT, SIMPLE_REPORT],
        description: reportType === SIMPLE_REPORT ? reportTypeHelperText : "",
      },

      operation_representative_name: {
        type: "array",
        title: "Operation representative",
        minItems: 1,
        items: {
          type: "number",
          enum: allRepresentatives.map(
            (representative: { id: number }) => representative.id,
          ),
          enumNames: allRepresentatives.map(
            (representative: { representative_name: string }) =>
              representative.representative_name,
          ),
        },
      },

      date_info: {
        type: "object",
        readOnly: true,
        title: `Please ensure this information was accurate for ${reportingWindowEnd}`,
      },

      operator_legal_name: { type: "string", title: "Operator legal name" },
      operator_trade_name: {
        type: ["string", "null"],
        title: "Operator trade name",
      },
      operation_name: { type: "string", title: "Operation name" },
      operation_type: {
        type: "string",
        title: "Operation type",
        default: [formDataState.operation_type || ""],
      },
      registration_purpose: {
        type: "string",
        title: "Registration Purpose",
      },
      operation_bcghgid: { type: ["string", "null"], title: "BCGHG ID" },
      ...(showBoroId && {
        bc_obps_regulated_operation_id: {
          type: "string",
          title: "BORO ID",
        },
      }),
      sync_button: {
        type: "object",
        properties: {
          label: { type: "string" },
          disabled: { type: "boolean", default: false },
        },
      },
    },

    dependencies: {
      operation_report_type: {
        oneOf: [
          {
            properties: {
              operation_report_type: {
                enum: [ANNUAL_REPORT],
              },
              ...(showActivities && {
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
              }),
              ...(showRegulatedProducts && {
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
              }),
            },
          },
          {
            properties: {
              operation_report_type: {
                enum: [SIMPLE_REPORT],
              },
            },
          },
        ],
      },
    },
  }) as unknown as RJSFSchema;

export const buildOperationReviewUiSchema = (
  operationId?: string,
  operationName?: string,
) => ({
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  "ui:order": [
    "purpose_note",
    "date_info",
    "operation_report_type",
    "operation_representative_name",
    "operator_legal_name",
    "operator_trade_name",
    "operation_name",
    "operation_type",
    "registration_purpose",
    "operation_bcghgid",
    "bc_obps_regulated_operation_id",
    "activities",
    "regulated_products",
    "sync_button",
  ],
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
    "ui:title": purposeNote(operationId, operationName || ""),
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
    "ui:options": {
      noteDescription: true,
    },
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
    "ui:widget": "MultiSelectWidget",
    "ui:options": {
      ...commonUiOptions,
      label: { style: { verticalAlign: "top" } },
    },
    "ui:placeholder": "Operation representative",
    uniqueItems: true,
  },
  sync_button: {},
});
