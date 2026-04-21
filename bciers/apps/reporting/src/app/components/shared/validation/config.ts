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
  operation_boro_id: createValidationUIConfig({
    label: "operation",
    renderMode: "inline_link",
    getHref: (ctx) =>
      ctx?.report_version_id
        ? `/reports/${ctx.report_version_id}/review-operation-information`
        : undefined,
    // no getMessage → use backend message
  }),

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

  attachment_not_scanned: createValidationUIConfig({
    label: "Attachments page",
    renderMode: "message_only",
    // no getMessage → use backend message which containes file name
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

  error_required_fields: createValidationUIConfig({
    label: (error) => String(error.context?.section_title ?? "review section"),
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
        review_facility_information: `/reports/${reportVersionId}/review-facility-information`,
        electricity_import_data: `/reports/${reportVersionId}/electricity-import-data`,
        new_entrant_information: `/reports/${reportVersionId}/new-entrant-information`,
      };

      // facility collection page (no facility_id)
      const facilityCollectionRoutes: Record<string, string> = {
        review_facilities: `/reporting/reports/${reportVersionId}/facilities/review-facilities`,
      };

      // facility-specific pages
      const facilitySectionRoutes: Record<
        string,
        (facilityId: string) => string
      > = {
        non_attributable_emissions: (id) =>
          `/reporting/reports/${reportVersionId}/facilities/${id}/non-attributable`,
        production_data: (id) =>
          `/reporting/reports/${reportVersionId}/facilities/${id}/production-data`,
        allocation_of_emissions: (id) =>
          `/reporting/reports/${reportVersionId}/facilities/${id}/allocation-of-emissions`,
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

  generic_error: createValidationUIConfig({
    renderMode: "message_only",
    getMessage: (error) =>
      error.message ??
      "An internal server error has occurred. Please contact ghgregulator@gov.bc.ca for help.",
  }),
};
