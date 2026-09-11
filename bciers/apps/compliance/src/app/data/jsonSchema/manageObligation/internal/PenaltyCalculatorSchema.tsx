import { RJSFSchema, UiSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import FieldTemplateFullWidth from "@bciers/components/form/fields/FieldTemplateFullWidth";
import {
  commonReadOnlyOptions,
  readOnlyStringField,
} from "@/compliance/src/app/data/jsonSchema/helpers";
import { PenaltySummaryField } from "@/compliance/src/app/components/compliance-summary/manage-obligation/internal/review-compliance-summary/PenaltySummaryField";
import { PenaltyAccrualDataGrid } from "@/compliance/src/app/components/compliance-summary/manage-obligation/internal/review-compliance-summary/PenaltyAccrualDataGrid";
import PenaltyTypeRadioWidget from "@/compliance/src/app/widgets/PenaltyTypeRadioWidget";
import { PenaltyType } from "@/compliance/src/app/types";

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
      enum: [PenaltyType.AUTOMATIC_OVERDUE, PenaltyType.LATE_SUBMISSION],
      default: PenaltyType.AUTOMATIC_OVERDUE,
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
        total_penalty_amount: { type: "string" },
        days_late: { type: "number" },
      },
      additionalProperties: false,
    },
    accrual_data: {
      type: "object",
      title: "Accrual data",
      properties: {
        // Identifies the query these rows came from; the grid remounts when it changes
        query_id: { type: "string" },
        rows: {
          type: "array",
          items: { type: "object" },
        },
      },
      additionalProperties: false,
    },
  },
};

// !block overrides FieldTemplate's inline-block label, which otherwise leaves MUI's
// inline-flex picker sitting beside its header rather than below it
const numberedSectionOptions = {
  labelOverrideStyle: "!block mb-4 font-normal text-bc-bg-blue",
};

// A factory, so minDate resolves when the page renders rather than at module load
export const createPenaltyCalculatorUiSchema = (): UiSchema => ({
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",

  automatic_overdue_penalty_status: commonReadOnlyOptions,
  ggeapar_interest_status: commonReadOnlyOptions,
  requested_penalty_type: {
    "ui:widget": PenaltyTypeRadioWidget,
    "ui:enumNames": ["Automatic overdue", "GGEAPAR"],
    "ui:FieldTemplate": FieldTemplate,
    "ui:classNames": "text-bc-bg-blue mt-8 mb-6",
    "ui:options": numberedSectionOptions,
  },
  final_day_of_penalty_accrual: {
    "ui:widget": "DateWidget",
    "ui:FieldTemplate": FieldTemplate,
    "ui:classNames": "text-bc-bg-blue [&>div]:max-w-[200px]",
    "ui:options": {
      ...numberedSectionOptions,
      simpleDateFormat: true,
      minDate: new Date(),
      actionBarActions: ["cancel", "today"],
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
    "ui:field": PenaltyAccrualDataGrid,
    "ui:FieldTemplate": FieldTemplateFullWidth,
  },
});
