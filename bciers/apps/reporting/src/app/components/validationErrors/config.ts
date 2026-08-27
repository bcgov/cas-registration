import {
  facilityRoutes,
  reportRoutes,
  resolveValidationHref,
} from "@reporting/src/app/utils/routes";
import {
  createValidationUIConfig,
  ValidationUIConfig,
} from "@bciers/components/validationErrors";
import { ValidationMessageKey } from "./types";

export const validationUIConfig: Partial<
  Record<ValidationMessageKey, ValidationUIConfig<ValidationMessageKey>>
> = {
  error_required_fields: createValidationUIConfig<ValidationMessageKey>({
    label: (error) => String(error.context?.section_title ?? "review section"),
    priority: 1,
    renderMode: "inline_link",
    getHref: resolveValidationHref,
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

  operation_boro_id: createValidationUIConfig<ValidationMessageKey>({
    label: "Review Operation Information",
    priority: 2,
    renderMode: "inline_link",
    getHref: (ctx) =>
      ctx?.report_version_id
        ? reportRoutes.reviewOperationInformation(Number(ctx.report_version_id))
        : undefined,
  }),

  report_activity_json_validation:
    createValidationUIConfig<ValidationMessageKey>({
      label: (error) => String(error.context?.activity_name ?? "Activity data"),
      priority: 3,
      renderMode: "inline_link",
      getHref: (ctx) =>
        ctx?.report_version_id && ctx?.facility_id && ctx?.activity_id
          ? facilityRoutes.activity(
              Number(ctx.report_version_id),
              String(ctx.facility_id),
              String(ctx.activity_id),
            )
          : undefined,
      formatMessage: ({ error }) => {
        const ctx = error.context;
        return `JSON schema validation failure detected for ${String(
          ctx?.facility_name ?? "facility",
        )} ${String(
          ctx?.activity_name ?? "activity",
        )}. Please forward this error message to ghgregulator@gov.bc.ca to resolve this issue.`;
      },
    }),

  report_data_out_of_bounds_by_fuel_type:
    createValidationUIConfig<ValidationMessageKey>({
      label: (error) => String(error.context?.activity_name ?? "activity data"),
      priority: 3,
      renderMode: "inline_link",
      getHref: (ctx) =>
        ctx?.report_version_id && ctx?.facility_id && ctx?.activity_id
          ? facilityRoutes.activity(
              Number(ctx.report_version_id),
              String(ctx.facility_id),
              String(ctx.activity_id),
            )
          : undefined,
      formatMessage: ({ label, error }) => {
        const ctx = error.context;
        return `Unusual value detected for ${String(ctx?.facility_name ?? "facility")} ${label ?? "activity data"}.
Expected ${String(ctx?.fuel_type_name ?? "fuel")} ${String(ctx?.reporting_field ?? "field")} value to be between ${String(ctx?.expected_range ?? "the allowed range")} but input was ${String(ctx?.user_input ?? "the provided value")}.
Please ensure you have selected the correct fuel name and the value is accurate.
If the value is accurate, you may save & continue.`;
      },
    }),

  report_data_out_of_bounds_by_reporting_field:
    createValidationUIConfig<ValidationMessageKey>({
      priority: 3,
      label: (error) => String(error.context?.activity_name ?? "activity"),
      renderMode: "inline_link",
      getHref: (ctx) =>
        ctx?.report_version_id && ctx?.facility_id && ctx?.activity_id
          ? facilityRoutes.activity(
              Number(ctx.report_version_id),
              String(ctx.facility_id),
              String(ctx.activity_id),
            )
          : undefined,
      formatMessage: ({ label, error }) => {
        const ctx = error.context;
        return `Unusual value detected for ${String(ctx?.facility_name ?? "facility")} ${label ?? "activity"}.
Expected ${String(ctx?.gas_type_name ?? "gas")} ${String(ctx?.reporting_field ?? "field")} value to be between ${String(ctx?.expected_range ?? "the allowed range")} but input was ${String(ctx?.user_input ?? "the provided value")}.
Please ensure the value entered is accurate.
If the value is accurate, you may save & continue.`;
      },
    }),

  allocation_mismatch: createValidationUIConfig<ValidationMessageKey>({
    label: "Allocation of Emissions page",
    priority: 3,
    renderMode: "inline_link",
    getHref: (ctx) =>
      ctx?.report_version_id && ctx?.facility_id
        ? facilityRoutes.allocationOfEmissions(
            Number(ctx.report_version_id),
            String(ctx.facility_id),
          )
        : undefined,
  }),

  missing_report_verification: createValidationUIConfig<ValidationMessageKey>({
    label: "Verification page",
    priority: 4,
    renderMode: "inline_link",
    getHref: (ctx) =>
      ctx?.report_version_id
        ? reportRoutes.verification(Number(ctx.report_version_id))
        : undefined,
  }),

  verification_statement: createValidationUIConfig<ValidationMessageKey>({
    label: "Attachments page",
    priority: 4,
    renderMode: "inline_link",
    getHref: (ctx) =>
      ctx?.report_version_id
        ? reportRoutes.attachments(Number(ctx.report_version_id))
        : undefined,
  }),

  attachment_not_scanned: createValidationUIConfig<ValidationMessageKey>({
    label: "Attachments page",
    renderMode: "message_only",
  }),

  missing_supplementary_report_required_attachment_confirmation:
    createValidationUIConfig<ValidationMessageKey>({
      label: "Attachments page",
      priority: 4,
      renderMode: "inline_link",
      getHref: (ctx) =>
        ctx?.report_version_id
          ? reportRoutes.attachments(Number(ctx.report_version_id))
          : undefined,
    }),

  missing_supplementary_report_existing_attachment_confirmation:
    createValidationUIConfig<ValidationMessageKey>({
      label: "Attachments page",
      priority: 4,
      renderMode: "inline_link",
      getHref: (ctx) =>
        ctx?.report_version_id
          ? reportRoutes.attachments(Number(ctx.report_version_id))
          : undefined,
    }),

  missing_supplementary_report_attachments_confirmation:
    createValidationUIConfig<ValidationMessageKey>({
      label: "Attachments page",
      priority: 4,
      renderMode: "inline_link",
      getHref: (ctx) =>
        ctx?.report_version_id
          ? reportRoutes.attachments(Number(ctx.report_version_id))
          : undefined,
    }),

  missing_supplementary_report_version_change:
    createValidationUIConfig<ValidationMessageKey>({
      label: "Review Changes page",
      priority: 3,
      renderMode: "inline_link",
      getHref: (ctx) =>
        ctx?.report_version_id
          ? reportRoutes.reviewChanges(Number(ctx.report_version_id))
          : undefined,
    }),

  missing_regulated_product: createValidationUIConfig<ValidationMessageKey>({
    label: "Review Operation Information",
    priority: 2,
    renderMode: "inline_link",
    getHref: (ctx) =>
      ctx?.report_version_id
        ? reportRoutes.reviewOperationInformation(Number(ctx.report_version_id))
        : undefined,
  }),

  og_np_nc_allocation_mismatch: createValidationUIConfig<ValidationMessageKey>({
    label: "allocation of emissions",
    priority: 3,
    renderMode: "inline_link",
    getHref: (ctx) =>
      ctx?.report_version_id && ctx?.facility_id
        ? facilityRoutes.allocationOfEmissions(
            Number(ctx.report_version_id),
            String(ctx.facility_id),
          )
        : undefined,
    formatMessage: ({ label, error: { context } }) =>
      `Facility ${String(context?.facility_name ?? "facility")}: Please review the ${label} and ensure that only excluded emissions are allocated to unregulated products. If they are allocated, you may save and continue.`,
  }),

  missing_operation_representative:
    createValidationUIConfig<ValidationMessageKey>({
      label: "add an operation representative for this operation",
      priority: 1,
      renderMode: "inline_link",
      openInNewTab: true,
      getHref: (ctx) =>
        ctx?.operation_id
          ? `/administration/operations/${ctx.operation_id}?operations_title=${encodeURIComponent(
              String(ctx.operation_name ?? ""),
            )}`
          : undefined,
      getMessage: () =>
        "Before you can continue, you must add an operation representative for this operation then return to this report.",
    }),
  generic_error: createValidationUIConfig<ValidationMessageKey>({
    renderMode: "message_only",
    getMessage: (error) =>
      error.message ??
      "An internal server error has occurred. Please contact ghgregulator@gov.bc.ca for help.",
  }),
};
