// ---- Types ----
export type ReportVersionId = string | number;
// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export type FacilityId = string;
export type ActivityId = string | number;

// ---- Base helpers ----
const baseReport = (reportVersionId: ReportVersionId) =>
  `/reports/${reportVersionId}`;

const baseFacility = (
  reportVersionId: ReportVersionId,
  facilityId: FacilityId,
) => `${baseReport(reportVersionId)}/facilities/${facilityId}`;

// ---- Report-level routes ----
export const reportRoutes = {
  reviewOperationInformation: (id: ReportVersionId) =>
    `${baseReport(id)}/review-operation-information`,

  personResponsible: (id: ReportVersionId) =>
    `${baseReport(id)}/person-responsible`,

  additionalReportingData: (id: ReportVersionId) =>
    `${baseReport(id)}/additional-reporting-data`,

  electricityImportData: (id: ReportVersionId) =>
    `${baseReport(id)}/electricity-import-data`,

  newEntrantInformation: (id: ReportVersionId) =>
    `${baseReport(id)}/new-entrant-information`,

  verification: (id: ReportVersionId) => `${baseReport(id)}/verification`,

  attachments: (id: ReportVersionId) => `${baseReport(id)}/attachments`,

  reviewChanges: (id: ReportVersionId) => `${baseReport(id)}/review-changes`,
};

// ---- Facility collection routes ----
export const facilityCollectionRoutes = {
  reviewFacilities: (id: ReportVersionId) =>
    `${baseReport(id)}/facilities/review-facilities`,

  reportInformation: (id: ReportVersionId) =>
    `${baseReport(id)}/facilities/report-information`,
};

// ---- Facility-specific routes ----
export const facilityRoutes = {
  reviewFacilityInformation: (
    reportVersionId: ReportVersionId,
    facilityId: FacilityId,
  ) =>
    `${baseFacility(reportVersionId, facilityId)}/review-facility-information`,

  activities: (reportVersionId: ReportVersionId, facilityId: FacilityId) =>
    `${baseFacility(reportVersionId, facilityId)}/activities`,

  activity: (
    reportVersionId: ReportVersionId,
    facilityId: FacilityId,
    activityId: ActivityId,
  ) =>
    `${baseFacility(reportVersionId, facilityId)}/activities?activity_id=${activityId}`,

  nonAttributable: (reportVersionId: ReportVersionId, facilityId: FacilityId) =>
    `${baseFacility(reportVersionId, facilityId)}/non-attributable`,

  productionData: (reportVersionId: ReportVersionId, facilityId: FacilityId) =>
    `${baseFacility(reportVersionId, facilityId)}/production-data`,

  allocationOfEmissions: (
    reportVersionId: ReportVersionId,
    facilityId: FacilityId,
  ) => `${baseFacility(reportVersionId, facilityId)}/allocation-of-emissions`,
};

// ---- Section → route resolver ----
export function resolveValidationHref(ctx?: {
  report_version_id?: ReportVersionId;
  facility_id?: string;
  activity_id?: ActivityId;
  section?: string;
}): string | undefined {
  if (!ctx?.report_version_id || !ctx?.section) return undefined;

  const id = ctx.report_version_id;
  const facilityId =
    typeof ctx.facility_id === "string" ? ctx.facility_id : undefined;

  const section = ctx.section;

  // Report-level sections
  const reportMap: Record<string, () => string> = {
    review_operation_information: () =>
      reportRoutes.reviewOperationInformation(id),
    person_responsible: () => reportRoutes.personResponsible(id),
    additional_reporting_data: () => reportRoutes.additionalReportingData(id),
    electricity_import_data: () => reportRoutes.electricityImportData(id),
    new_entrant_information: () => reportRoutes.newEntrantInformation(id),
  };

  // Facility collection sections
  const facilityCollectionMap: Record<string, () => string> = {
    review_facilities: () => facilityCollectionRoutes.reviewFacilities(id),
    review_facility_report_information: () =>
      facilityCollectionRoutes.reportInformation(id),
  };

  // Facility-specific sections
  const facilityMap: Record<string, (facilityId: string) => string> = {
    review_facility_information: (fid) =>
      facilityRoutes.reviewFacilityInformation(id, fid),
    activity_data: (fid) => facilityRoutes.activities(id, fid),
    non_attributable_emissions: (fid) =>
      facilityRoutes.nonAttributable(id, fid),
    production_data: (fid) => facilityRoutes.productionData(id, fid),
    allocation_of_emissions: (fid) =>
      facilityRoutes.allocationOfEmissions(id, fid),
  };

  if (section in reportMap) {
    return reportMap[section]();
  }

  if (section in facilityCollectionMap) {
    return facilityCollectionMap[section]();
  }

  if (facilityId && section in facilityMap) {
    return facilityMap[section](facilityId);
  }

  return undefined;
}
