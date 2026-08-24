import { RJSFSchema, UiSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import FieldTemplateFullWidth from "@bciers/components/form/fields/FieldTemplateFullWidth";
import {
  commonReadOnlyOptions,
  readOnlyStringField,
} from "@/compliance/src/app/data/jsonSchema/helpers";
import { TableField } from "@/compliance/src/app/widgets/TableWidget";
import { PenaltyTypeButtonGroupWidget } from "../../../../components/compliance-summary/manage-obligation/internal/review-compliance-summary/PenaltyTypeButtonGroupWidget";
import { PenaltySummaryField } from "../../../../components/compliance-summary/manage-obligation/internal/review-compliance-summary/PenaltySummaryWidget";

export const penaltyCalculatorSchema: RJSFSchema = {
  type: "object",
  title: "Penalty Calculator",
  properties: {
    automatic_overdue_penalty_status: readOnlyStringField(
      "Automatic overdue penalty:",
    ),
    ggeapar_interest_status: readOnlyStringField("GGEAPAR interest:"),
    requested_penalty_type: {
      type: "string",
      title: "1. Select penalty type",
      enum: ["automatic_overdue", "ggeapar"],
      default: "automatic_overdue",
    },
    final_day_of_penalty_accrual: {
      type: "string",
      format: "date",
      title: "2. Select final day of penalty accrual",
    },
    penalty_summary: {
      type: "object",
      title: "Penalty summary",
      properties: {
        total_penalty_amount: {
          type: ["string", "number", "null"],
        },
        days_late: {
          type: ["string", "number", "null"],
        },
      },
      additionalProperties: false,
    },
    accrual_data: {
      type: "object",
      title: "Accrual data",
      properties: {
        tableData: {
          type: "array",
          items: {
            type: "array",
            items: {
              type: ["string", "number", "null"],
            },
          },
        },
      },
      additionalProperties: false,
    },
  },
};

export const penaltyCalculatorUiSchema: UiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",

  automatic_overdue_penalty_status: commonReadOnlyOptions,
  ggeapar_interest_status: commonReadOnlyOptions,
  requested_penalty_type: {
    "ui:widget": PenaltyTypeButtonGroupWidget,
    "ui:options": {
      label: false,
      classNames: "text-bc-bg-blue",
    },
  },
  final_day_of_penalty_accrual: {
    "ui:widget": "DateWidget",
    "ui:FieldTemplate": FieldTemplate,
    "ui:classNames": "text-bc-bg-blue",
    "ui:options": {
      simpleDateFormat: true,
      labelOverrideStyle: "font-normal text-bc-bg-blue",
    },
  },
  penalty_summary: {
    "ui:field": PenaltySummaryField,
    "ui:FieldTemplate": FieldTemplateFullWidth,
    "ui:options": {
      label: false,
      inline: true,
    },
    "ui:classNames": "!block [&>div]:!w-full [&>div]:!max-w-none",
  },
  accrual_data: {
    "ui:field": TableField,
    "ui:FieldTemplate": FieldTemplateFullWidth,
    "ui:options": {
      rowsPerPage: 10,
      columnHeaders: [
        "Date",
        "Daily Penalty",
        "Daily compounded",
        "Accumulated penalty",
        "Accumulated compounded",
        "Interest rate %",
      ],
    },
  },
};
