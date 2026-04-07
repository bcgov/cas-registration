import type { ReportValidationMessageKey, ValidationUIConfig } from "./types";

// Frontend mapping of backend validation keys defining how each validation error is displayed in the UI
export const validationUIConfig: Partial<
  Record<ReportValidationMessageKey, ValidationUIConfig>
> = {
  missing_report_verification: {
    label: "Verification page",
    renderMode: "inline_link",
    getHref: (ctx) =>
      ctx?.reportVersionId
        ? `/reports/${ctx.reportVersionId}/verification`
        : undefined,
    getMessage: () =>
      "Verification information must be completed on the Verification page.",
  },

  verification_statement: {
    label: "Attachments page",
    renderMode: "inline_link",
    getHref: (ctx) =>
      ctx?.reportVersionId
        ? `/reports/${ctx.reportVersionId}/attachments`
        : undefined,
    getMessage: () =>
      "A verification statement must be uploaded with this report on the Attachments page.",
  },

  missing_supplementary_report_version_change: {
    label: "Review Changes page",
    renderMode: "inline_link",
    getHref: (ctx) =>
      ctx?.reportVersionId
        ? `/reports/${ctx.reportVersionId}/review-changes`
        : undefined,
    getMessage: () =>
      "A reason for the changes in this supplementary report must be added on the Review Changes page.",
  },

  missing_required_attachment_confirmation: {
    label: "Attachments page",
    renderMode: "inline_link",
    getHref: (ctx) =>
      ctx?.reportVersionId
        ? `/reports/${ctx.reportVersionId}/attachments`
        : undefined,
    getMessage: () =>
      "You must confirm that all required supplementary attachments have been uploaded on the Attachments page.",
  },

  missing_existing_attachment_confirmation: {
    label: "Attachments page",
    renderMode: "inline_link",
    getHref: (ctx) =>
      ctx?.reportVersionId
        ? `/reports/${ctx.reportVersionId}/attachments`
        : undefined,
    getMessage: () =>
      "You must confirm that all existing attachments are still relevant to the supplementary submission on the Attachments page.",
  },

  missing_supplementary_report_attachment_confirmation: {
    label: "Attachments page",
    renderMode: "inline_link",
    getHref: (ctx) =>
      ctx?.reportVersionId
        ? `/reports/${ctx.reportVersionId}/attachments`
        : undefined,
    getMessage: () =>
      "You must confirm that all required supplementary attachments have been uploaded and existing attachments are still relevant to the supplementary submission on the Attachments page.",
  },

  error_operation_information: {
    label: "review operation information",
    renderMode: "inline_link",
    getHref: (ctx) =>
      ctx?.reportVersionId
        ? `/reports/${ctx.reportVersionId}/review-operation-information`
        : undefined,
    getMessage: () =>
      "Required fields are empty on review operation information.",
  },

  error_activity_value: {
    label: (error) => error.context?.activityName ?? "activity name",
    renderMode: "inline_link",

    getHref: (ctx) =>
      ctx?.reportVersionId && ctx?.facilityId && ctx?.activityId !== undefined
        ? `/reporting/reports/${ctx.reportVersionId}/facilities/${ctx.facilityId}/activities?activity_id=${ctx.activityId}`
        : undefined,

    getMessage: (error) => {
      const ctx = error.context;

      return `Unusual value detected for ${
        ctx?.activityName ?? "[activity name]"
      }. Expected ${ctx?.fuelType ?? "[fuel type]"} ${
        ctx?.fieldName ?? "[field]"
      } value to be between ${
        ctx?.expectedRange ?? "[range]"
      } but input was ${ctx?.userInput ?? "[user input]"}. Please ensure you have selected the correct fuel name and the value is accurate. If the value is accurate, you may save & continue.`;
    },
  },

  allocation_mismatch: {
    label: () => "allocation of emissions",
    renderMode: "inline_link",
    getHref: (ctx) =>
      ctx?.reportVersionId && ctx?.facilityId
        ? `/reporting/reports/${ctx.reportVersionId}/facilities/${ctx.facilityId}/allocation-of-emissions`
        : undefined,
    getMessage: (error) => {
      const ctx = error.context;

      return `Please review the allocation of emissions and ensure that emissions from ${
        ctx?.sourceActivityName ?? "[activity type]"
      } activities are allocated to the ${
        ctx?.targetProductName ?? "[product]"
      }. If they are allocated to the ${
        ctx?.targetProductName ?? "[product]"
      }, you may save & continue.`;
    },
  },

  error_lime_kiln: {
    label: "Pulp and Paper Production",
    renderMode: "inline_link",
    getHref: (ctx) =>
      ctx?.reportVersionId && ctx?.facilityId
        ? `/reports/${ctx.reportVersionId}/facilities/${ctx.facilityId}/production-data`
        : undefined,
    getMessage: () =>
      'Error in Pulp and Paper Production. To proceed, select "Yes" to the question "Does this operation utilize a lime recovery kiln?"',
  },
};
