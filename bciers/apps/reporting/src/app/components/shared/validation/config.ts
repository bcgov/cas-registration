import type { ReportValidationMessageKey, ValidationUIConfig } from "./types";

// Frontend mapping of backend validation keys defining how each validation error is displayed in the UI

type ValidationUIConfigInput = Omit<
  ValidationUIConfig,
  "resolveHref" | "resolveLabel" | "resolveMessage" | "resolveFormattedMessage"
>;

function createValidationUIConfig(
  config: ValidationUIConfigInput,
): ValidationUIConfig {
  return {
    ...config,

    resolveHref(error) {
      return this.getHref?.(error.context);
    },

    resolveLabel(error) {
      return typeof this.label === "function" ? this.label(error) : this.label;
    },

    resolveMessage(error, key) {
      return this.getMessage?.(error) ?? error.message ?? key;
    },

    resolveFormattedMessage(error, key) {
      const label = this.resolveLabel(error);
      const message = this.resolveMessage(error, key);

      if (this.formatMessage) {
        return this.formatMessage({ label, message, error });
      }

      return message;
    },
  };
}

export const validationUIConfig: Partial<
  Record<ReportValidationMessageKey, ValidationUIConfig>
> = {
  missing_report_verification: createValidationUIConfig({
    label: "Verification page",
    renderMode: "inline_link",
    getHref: (ctx) =>
      ctx?.report_version_id
        ? `/reports/${ctx.report_version_id}/verification`
        : undefined,
    getMessage: () =>
      "Verification information must be completed on the Verification page.",
  }),

  verification_statement: createValidationUIConfig({
    label: "Attachments page",
    renderMode: "inline_link",
    getHref: (ctx) =>
      ctx?.report_version_id
        ? `/reports/${ctx.report_version_id}/attachments`
        : undefined,
    getMessage: () =>
      "A verification statement must be uploaded with this report on the Attachments page.",
  }),

  missing_supplementary_report_version_change: createValidationUIConfig({
    label: "Review Changes page",
    renderMode: "inline_link",
    getHref: (ctx) =>
      ctx?.report_version_id
        ? `/reports/${ctx.report_version_id}/review-changes`
        : undefined,
    getMessage: () =>
      "A reason for the changes in this supplementary report must be added on the Review Changes page.",
  }),

  missing_required_attachment_confirmation: createValidationUIConfig({
    label: "Attachments page",
    renderMode: "inline_link",
    getHref: (ctx) =>
      ctx?.report_version_id
        ? `/reports/${ctx.report_version_id}/attachments`
        : undefined,
    getMessage: () =>
      "You must confirm that all required supplementary attachments have been uploaded on the Attachments page.",
  }),

  missing_existing_attachment_confirmation: createValidationUIConfig({
    label: "Attachments page",
    renderMode: "inline_link",
    getHref: (ctx) =>
      ctx?.report_version_id
        ? `/reports/${ctx.report_version_id}/attachments`
        : undefined,
    getMessage: () =>
      "You must confirm that all existing attachments are still relevant to the supplementary submission on the Attachments page.",
  }),

  missing_supplementary_report_attachment_confirmation:
    createValidationUIConfig({
      label: "Attachments page",
      renderMode: "inline_link",
      getHref: (ctx) =>
        ctx?.report_version_id
          ? `/reports/${ctx.report_version_id}/attachments`
          : undefined,
      getMessage: () =>
        "You must confirm that all required supplementary attachments have been uploaded and existing attachments are still relevant to the supplementary submission on the Attachments page.",
    }),

  error_report_operation_information: createValidationUIConfig({
    label: "review operation information",
    renderMode: "inline_link",
    getHref: (ctx) =>
      ctx?.report_version_id
        ? `/reports/${ctx.report_version_id}/review-operation-information`
        : undefined,
    getMessage: (error) => {
      const missingFields = error.context?.missing_fields;

      return Array.isArray(missingFields) && missingFields.length > 0
        ? `Required fields are empty on review operation information: ${missingFields.join(", ")}.`
        : "Required fields are empty on review operation information.";
    },
  }),

  error_activity_value: createValidationUIConfig({
    label: (error) => String(error.context?.activityName ?? "activity name"),
    renderMode: "inline_link",
    getHref: (ctx) =>
      ctx?.report_version_id && ctx?.facilityId && ctx?.activityId !== undefined
        ? `/reporting/reports/${ctx.report_version_id}/facilities/${ctx.facilityId}/activities?activity_id=${ctx.activityId}`
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
  }),

  allocation_mismatch: createValidationUIConfig({
    label: () => "allocation of emissions",
    renderMode: "inline_link",
    getHref: (ctx) =>
      ctx?.report_version_id && ctx?.facility_id
        ? `/reporting/reports/${ctx.report_version_id}/facilities/${ctx.facility_id}/allocation-of-emissions`
        : undefined,
    formatMessage: ({ label, error }) => {
      const ctx = error.context;

      const category = ctx?.emission_category_name ?? "[emission category]";

      return `Please review the ${label} and ensure that emissions from ${category} activity are allocated to the ${category} product. If they are allocated, you may save & continue.`;
    },
  }),

  error_lime_kiln: createValidationUIConfig({
    label: "Pulp and Paper Production",
    renderMode: "inline_link",
    getHref: (ctx) =>
      ctx?.report_version_id && ctx?.facilityId
        ? `/reports/${ctx.report_version_id}/facilities/${ctx.facilityId}/production-data`
        : undefined,
    getMessage: () =>
      'Error in Pulp and Paper Production. To proceed, select "Yes" to the question "Does this operation utilize a lime recovery kiln?"',
  }),

  generic_error: createValidationUIConfig({
    renderMode: "message_only",
    getMessage: (error) =>
      error.message ??
      "An internal server error has occurred. Please contact ghgregulator@gov.bc.ca for help.",
  }),
};
