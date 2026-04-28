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
  error_required_fields: createValidationUIConfig({
    label: (error) => String(error.context?.section_title ?? "review section"),
    priority: 1,
    renderMode: "inline_link",
    getHref: (ctx) => {
      if (!ctx?.report_version_id || !ctx?.section) return undefined;

      const reportVersionId = String(ctx.report_version_id);

      const facilityId =
        typeof ctx.facility_id === "string" ? ctx.facility_id : undefined;

      const section = String(ctx.section);

      // report-level pages
      const reportLevelRoutes: Record<string, string> = {
        review_operation_information: `/reports/${reportVersionId}/review-operation-information`,
        person_responsible: `/reports/${reportVersionId}/person-responsible`,
        additional_reporting_data: `/reports/${reportVersionId}/additional-reporting-data`,
        electricity_import_data: `/reports/${reportVersionId}/electricity-import-data`,
        new_entrant_information: `/reports/${reportVersionId}/new-entrant-information`,
      };

      // all facilities pages
      const facilityCollectionRoutes: Record<string, string> = {
        review_facilities: `/reports/${reportVersionId}/facilities/review-facilities`,
        review_facility_report_information: `/reports/${reportVersionId}/facilities/report-information`,
      };

      // facility-specific pages
      const facilitySectionRoutes: Record<
        string,
        (facilityId: string) => string
      > = {
        review_facility_information: (id) =>
          `/reports/${reportVersionId}/facilities/${id}/review-facility-information`,
        activity_data: (id) =>
          `/reports/${reportVersionId}/facilities/${id}/activities`,
        non_attributable_emissions: (id) =>
          `/reports/${reportVersionId}/facilities/${id}/non-attributable`,
        production_data: (id) =>
          `/reports/${reportVersionId}/facilities/${id}/production-data`,
        allocation_of_emissions: (id) =>
          `/reports/${reportVersionId}/facilities/${id}/allocation-of-emissions`,
      };

      if (section in reportLevelRoutes) {
        return reportLevelRoutes[section];
      }

      if (section in facilityCollectionRoutes) {
        return facilityCollectionRoutes[section];
      }

      if (facilityId && section in facilitySectionRoutes) {
        return facilitySectionRoutes[section](facilityId);
      }

      return undefined;
    },
    getMessage: (error) => {
      const sectionTitle = error.context?.section_title ?? "this section";
      const facilityName = error.context?.facility_name;
      const missingFields = error.context?.missing_fields;

      const location = facilityName
        ? `${sectionTitle} for ${facilityName}`
        : sectionTitle;

      return Array.isArray(missingFields) && missingFields.length > 0
        ? `Required fields are empty on ${location}: ${missingFields.join(", ")}.`
        : `Required fields are empty on ${location}.`;
    },
  }),

  operation_boro_id: createValidationUIConfig({
    label: "Review Operation Information",
    priority: 2,
    renderMode: "inline_link",
    getHref: (ctx) =>
      ctx?.report_version_id
        ? `/reports/${ctx.report_version_id}/review-operation-information`
        : undefined,
  }),

  activity_data_coverage: createValidationUIConfig({
    label: (error) => String(error.context?.section_title ?? "Activities"),
    priority: 2,
    renderMode: "inline_link",

    getHref: (ctx) =>
      ctx?.report_version_id && ctx?.facility_id
        ? `/reports/${ctx.report_version_id}/facilities/${ctx.facility_id}/activities`
        : undefined,

    formatMessage: ({ error }) => {
      const ctx = error.context;

      return `Missing activity data for ${String(
        ctx?.facility_name ?? "facility",
      )}. Not all required activities have been reported in Activities.`;
    },
  }),

  report_activity_json_validation: createValidationUIConfig({
    label: (error) => String(error.context?.activity_name ?? "Activity data"),
    priority: 3,
    renderMode: "inline_link",

    getHref: (ctx) =>
      ctx?.report_version_id && ctx?.facility_id && ctx?.activity_id
        ? `/reports/${ctx.report_version_id}/facilities/${ctx.facility_id}/activities/${ctx.activity_id}`
        : undefined,

    formatMessage: ({ error }) => {
      const ctx = error.context;

      return `Validation error detected for ${String(
        ctx?.facility_name ?? "facility",
      )} ${String(
        ctx?.activity_name ?? "activity",
      )}. Please review the activity data and correct any invalid or unexpected values.`;
    },
  }),

  report_data_out_of_bounds_by_fuel_type: createValidationUIConfig({
    label: (error) => String(error.context?.activity_name ?? "activity data"),
    priority: 3,
    renderMode: "inline_link",

    getHref: (ctx) =>
      ctx?.report_version_id && ctx?.facility_id && ctx?.activity_id
        ? `/reports/${ctx.report_version_id}/facilities/${ctx.facility_id}/activities/${ctx.activity_id}`
        : undefined,

    formatMessage: ({ label, error }) => {
      const ctx = error.context;

      return `Unusual value detected for fuel type for ${String(ctx?.facility_name ?? "facility")} in ${label}.
Expected ${String(ctx?.fuel_type_name ?? "fuel")} value to be within the allowed range,
but the input appears outside expected bounds.
Please ensure you have selected the correct fuel type and entered an accurate value.
If the value is correct, you may save & continue.`;
    },
  }),

  report_data_out_of_bounds_by_reporting_field: createValidationUIConfig({
    priority: 3,
    label: (error) => String(error.context?.activity_name ?? "activity"),
    renderMode: "inline_link",

    getHref: (ctx) =>
      ctx?.report_version_id && ctx?.facility_id && ctx?.activity_id
        ? `/reports/${ctx.report_version_id}/facilities/${ctx.facility_id}/activities/${ctx.activity_id}`
        : undefined,

    formatMessage: ({ error }) => {
      const ctx = error.context;

      return `Unusual value detected for reporting field for ${ctx?.facility_name ?? "facility"} ${ctx?.activity_name ?? "activity"}.
Expected ${ctx?.reporting_field ?? "field"} value for ${ctx?.gas_type_name ?? "gas"} to be within the allowed range,
but the input appears outside expected bounds.
Please ensure the value entered is accurate.
If the value is correct, you may save & continue.`;
    },
  }),

  allocation_mismatch: createValidationUIConfig({
    label: () => "Allocation of Emissions page",
    priority: 3,
    renderMode: "inline_link",
    getHref: (ctx) =>
      ctx?.report_version_id && ctx?.facility_id
        ? `/reports/${ctx.report_version_id}/facilities/${ctx.facility_id}/allocation-of-emissions`
        : undefined,
  }),

  missing_report_verification: createValidationUIConfig({
    label: "Verification page",
    priority: 4,
    renderMode: "inline_link",
    getHref: (ctx) =>
      ctx?.report_version_id
        ? `/reports/${ctx.report_version_id}/verification`
        : undefined,
  }),

  verification_statement: createValidationUIConfig({
    label: "Attachments page",
    priority: 4,
    renderMode: "inline_link",
    getHref: (ctx) =>
      ctx?.report_version_id
        ? `/reports/${ctx.report_version_id}/attachments`
        : undefined,
  }),

  attachment_not_scanned: createValidationUIConfig({
    label: "Attachments page",
    renderMode: "message_only",
  }),

  missing_supplementary_report_required_attachment_confirmation:
    createValidationUIConfig({
      label: "Attachments page",
      priority: 4,
      renderMode: "inline_link",
      getHref: (ctx) =>
        ctx?.report_version_id
          ? `/reports/${ctx.report_version_id}/attachments`
          : undefined,
    }),

  missing_supplementary_report_existing_attachment_confirmation:
    createValidationUIConfig({
      label: "Attachments page",
      priority: 4,
      renderMode: "inline_link",
      getHref: (ctx) =>
        ctx?.report_version_id
          ? `/reports/${ctx.report_version_id}/attachments`
          : undefined,
    }),

  missing_supplementary_report_attachments_confirmation:
    createValidationUIConfig({
      label: "Attachments page",
      priority: 4,
      renderMode: "inline_link",
      getHref: (ctx) =>
        ctx?.report_version_id
          ? `/reports/${ctx.report_version_id}/attachments`
          : undefined,
    }),

  missing_supplementary_report_version_change: createValidationUIConfig({
    label: "Review Changes page",
    priority: 3,
    renderMode: "inline_link",
    getHref: (ctx) =>
      ctx?.report_version_id
        ? `/reports/${ctx.report_version_id}/review-changes`
        : undefined,
  }),

  generic_error: createValidationUIConfig({
    renderMode: "message_only",
    getMessage: (error) =>
      error.message ??
      "An internal server error has occurred. Please contact ghgregulator@gov.bc.ca for help.",
  }),
};
