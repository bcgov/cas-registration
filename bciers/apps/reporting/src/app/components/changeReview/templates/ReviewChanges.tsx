import React from "react";
import { Box, Typography, Divider } from "@mui/material";
import { ReviewChangesProps } from "../constants/types";
import { ChangeItemDisplay } from "./ChangeItemDisplay";
import { FacilityReportSection } from "../../shared/FacilityReportSection";
import { SectionReview } from "../../finalReview/templates/SectionReview";
import { FieldDisplay } from "../../finalReview/templates/FieldDisplay";
import { SimpleActivityDiff } from "../components/SimpleActivityDiff";
import { EmissionSummaryChangeView } from "./EmissionSummaryChangeView";
import { ProductionDataChangeView } from "./ProductionDataChangeView";
import { EmissionAllocationChangeView } from "./EmissionAllocationChangeView";
import { NonAttributableEmissionItem } from "./NonAttributableEmission";
import OperationEmissionSummary from "./OperationEmissionSummary";
import ElectricityImportData from "./ElectricityImportData";
import NewEntrantChanges from "./NewEntrantChanges";
import AdditionalReportingData from "./AdditionalReportingData";
import ComplianceSummary from "./ComplianceSummary";
import {
  complianceNote,
  reviewChangesNote,
} from "@reporting/src/data/jsonSchema/changeReview/complianceNote";
import {
  OPTED_IN_OPERATION,
  REGULATED_OPERATION_REGISTRATION_PURPOSE,
  REPORTING_OPERATION,
} from "@reporting/src/app/utils/constants";
import {
  filterExcludedFields,
  getSection,
  groupPersonResponsibleChanges,
  normalizeChangeKeys,
} from "../utils/utils";

// ─── Group facility-level changes by facility name ───────────────
function groupByFacility(changes: any[]): Record<string, any[]> {
  const out: Record<string, any[]> = {};
  for (const c of changes) {
    const m = (c.field as string).match(/\['facility_reports']\['([^']+)']/);
    if (!m) continue;
    const name = m[1];
    if (!out[name]) out[name] = [];
    out[name].push(c);
  }
  return out;
}

export const ReviewChanges: React.FC<ReviewChangesProps> = ({
  changes,
  registrationPurpose,
  reportingFieldDisplayTitleBySlug,
}) => {
  const normalizedChanges = normalizeChangeKeys(filterExcludedFields(changes));

  const showChanges = [
    REGULATED_OPERATION_REGISTRATION_PURPOSE,
    OPTED_IN_OPERATION,
  ].includes(registrationPurpose);

  const isReportingOnly = registrationPurpose === REPORTING_OPERATION;

  const filterByField = (prefixes: string[], includes: string[] = []) =>
    normalizedChanges.filter(
      (c: { field: string }) =>
        prefixes.some((p) => c.field.startsWith(p)) ||
        includes.some((inc) => c.field.includes(inc)),
    );

  const personResponsibleItems = filterByField([
    "root['report_person_responsible']",
  ]).filter(
    (c: { field: string }) =>
      c.field !== "root['report_person_responsible']['report_version']",
  );

  const complianceChanges = filterByField([
    "root['report_compliance_summary']",
  ]);
  const facilityReportChanges = filterByField([], ["['facility_reports']"]);
  const electricityImportChanges = filterByField([
    "root['report_electricity_import_data']",
  ]);
  const additionalReportingDataChanges = filterByField([
    "root['report_additional_data']",
  ]);
  const newEntrantChanges = filterByField(["root['report_new_entrant']"]);
  const operationEmissionSummaryChanges = filterByField([
    "root['operation_emission_summary']",
  ]);

  const otherChanges = normalizedChanges.filter(
    (c: any) =>
      ![
        ...facilityReportChanges,
        ...complianceChanges,
        ...electricityImportChanges,
        ...newEntrantChanges,
        ...operationEmissionSummaryChanges,
      ].includes(c),
  );

  const sectioned: Record<string, any[]> = {};
  otherChanges.forEach((change: any) => {
    const section = getSection(change.field);
    if (!sectioned[section]) sectioned[section] = [];
    sectioned[section].push(change);
  });

  const renderSection = (
    title: string,
    items: any[],
    groupPersonResponsible = false,
  ) => {
    if (!items.length) return null;
    const processedItems = groupPersonResponsible
      ? groupPersonResponsibleChanges(items)
      : items;
    return (
      <Box mb={4}>
        <Typography className="form-heading text-xl font-bold flex items-center text-bc-bg-blue">
          {title}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {processedItems.map((item: any, idx: number) => (
          <ChangeItemDisplay key={item.field + idx} item={item} />
        ))}
      </Box>
    );
  };

  // ─── per-facility rendering ───────────────────────────────────
  const facilityGroups = groupByFacility(facilityReportChanges);

  const reportOperationItems = sectioned["Report Operation"] || [];

  return (
    <Box className="w-full">
      <div className="form-heading text-xl font-bold flex items-center">
        Review Changes
      </div>
      <div className="form-group w-full my-8">
        {showChanges ? complianceNote : reviewChangesNote}
      </div>

      {renderSection("Review Operation Information", reportOperationItems)}
      {renderSection("Person Responsible", personResponsibleItems, true)}

      {/* ── Facility Reports ── */}
      {Object.entries(facilityGroups).map(([facilityName, facilityChanges]) => {
        // Whole-facility add / remove
        const wholeFacility = facilityChanges.find(
          (c) => c.field === `root['facility_reports']['${facilityName}']`,
        );
        if (wholeFacility) {
          const val =
            wholeFacility.change_type === "removed"
              ? (wholeFacility.oldValue ?? wholeFacility.old_value)
              : (wholeFacility.newValue ?? wholeFacility.new_value);
          return (
            <Box key={facilityName} mb={4}>
              <FacilityReportSection
                facilityName={facilityName}
                facilityData={val ?? {}}
                isAdded={wholeFacility.change_type === "added"}
                isRemoved={wholeFacility.change_type === "removed"}
                showWhenNotReportingOnly={!isReportingOnly}
              />
            </Box>
          );
        }

        // Partition changes into sections
        const activityChanges = facilityChanges.filter((c) =>
          c.field.includes("['activity_data']"),
        );
        const emissionSummaryChanges = facilityChanges.filter((c) =>
          c.field.includes("['emission_summary']"),
        );
        const productionDataChanges = facilityChanges.filter((c) =>
          c.field.includes("['report_products']"),
        );
        const emissionAllocationChanges = facilityChanges.filter((c) =>
          c.field.includes("['report_emission_allocation']"),
        );
        const nonAttributableChanges = facilityChanges.filter((c) =>
          c.field.includes("['reportnonattributableemissions_records']"),
        );
        const facilityNameChange = facilityChanges.find((c) =>
          c.field.endsWith("['facility_name']"),
        );

        return (
          <Box key={facilityName} mb={4}>
            <SectionReview
              title={`Report Information - ${facilityName}`}
              fields={[]}
              data={{}}
              expandable={true}
            >
              {/* Facility name change */}
              {facilityNameChange && (
                <Box ml={2}>
                  <ChangeItemDisplay
                    item={{
                      ...facilityNameChange,
                      displayLabel: "Facility Name",
                    }}
                  />
                </Box>
              )}

              {/* Activity data */}
              {activityChanges.length > 0 && (
                <Box mb={3}>
                  <SimpleActivityDiff
                    changes={activityChanges}
                    hideFacilityHeaders
                    reportingFieldDisplayTitleBySlug={
                      reportingFieldDisplayTitleBySlug
                    }
                  />
                </Box>
              )}

              {/* Emission summary */}
              {emissionSummaryChanges.length > 0 && (
                <Box mb={3}>
                  <EmissionSummaryChangeView data={emissionSummaryChanges} />
                </Box>
              )}

              {/* Production data */}
              {!isReportingOnly && productionDataChanges.length > 0 && (
                <Box mb={3}>
                  <ProductionDataChangeView data={productionDataChanges} />
                </Box>
              )}

              {/* Emission allocation */}
              {!isReportingOnly && emissionAllocationChanges.length > 0 && (
                <Box mb={3}>
                  <EmissionAllocationChangeView
                    data={emissionAllocationChanges}
                  />
                </Box>
              )}

              {/* Non-attributable emissions */}
              {nonAttributableChanges.length > 0 && (
                <Box mb={3}>
                  <SectionReview
                    title="Non-Attributable Emissions"
                    data={{}}
                    fields={[]}
                  >
                    <Box ml={2}>
                      <FieldDisplay
                        label="Did your non-attributable emissions exceed 100 tCO2e?"
                        value={nonAttributableChanges.some(
                          (c: any) => c.change_type !== "removed",
                        )}
                      />
                      {nonAttributableChanges.map(
                        (change: any, idx: number) => (
                          <NonAttributableEmissionItem
                            key={`${change.field}-${idx}`}
                            change={change}
                          />
                        ),
                      )}
                    </Box>
                  </SectionReview>
                </Box>
              )}
            </SectionReview>
          </Box>
        );
      })}

      {additionalReportingDataChanges.length > 0 && (
        <AdditionalReportingData changes={additionalReportingDataChanges} />
      )}
      {newEntrantChanges.length > 0 && (
        <NewEntrantChanges changes={newEntrantChanges} />
      )}
      {electricityImportChanges.length > 0 && (
        <ElectricityImportData changes={electricityImportChanges} />
      )}
      {operationEmissionSummaryChanges.length > 0 && (
        <OperationEmissionSummary changes={operationEmissionSummaryChanges} />
      )}
      {complianceChanges.length > 0 && (
        <ComplianceSummary changes={complianceChanges} />
      )}
      {changes.length === 0 && (
        <Typography color="text.secondary">
          No changes detected between the selected report versions.
        </Typography>
      )}
    </Box>
  );
};
