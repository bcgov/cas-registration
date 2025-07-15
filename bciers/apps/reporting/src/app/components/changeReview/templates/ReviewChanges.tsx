import React from "react";
import { Box, Typography, Divider } from "@mui/material";
import { ReviewChangesProps } from "../constants/types";
import { ChangeItemDisplay } from "./ChangeItemDisplay";
import { FacilityReportChanges } from "./FacilityReportChanges";
import { organizeFacilityReportChanges } from "./facilityReportOrganizer";
import {
  detectActivityChangesInModifiedFacility,
  detectSourceTypeChanges,
  SourceTypeChange,
} from "./facilityReportParser";
import {
  filterExcludedFields,
  getSection,
  groupPersonResponsibleChanges,
} from "../utils/utils";
import OperationEmissionSummary from "./OperationEmissionSummary";
import ElectricityImportData from "./ElectricityImportData";
import NewEntrantChanges from "./NewEntrantChanges";
import ComplianceSummary from "@reporting/src/app/components/changeReview/templates/ ComplianceSummary";

const ReviewChanges: React.FC<ReviewChangesProps> = ({ changes }) => {
  const filteredChanges = filterExcludedFields(changes);

  const complianceChanges = filteredChanges.filter((change) =>
    change.field.startsWith("root['report_compliance_summary']"),
  );

  const facilityReportChanges = filteredChanges.filter((change) =>
    change.field.includes("['facility_reports']"),
  );

  const electricityImportChanges = filteredChanges.filter((change) =>
    change.field.startsWith("root['report_electricity_import_data']"),
  );

  const newEntrantChanges = filteredChanges.filter((change) =>
    change.field.startsWith("root['report_new_entrant']"),
  );

  const reportInformationChanges = filteredChanges.filter(
    (change) =>
      change.field.startsWith("root['report_information']") ||
      change.field.includes("['report_operation_information']") ||
      change.field.includes("['reporting_window_start']") ||
      change.field.includes("['reporting_window_end']") ||
      change.field.includes("['report_type']"),
  );

  const operationEmissionSummaryChanges = filteredChanges.filter((change) =>
    change.field.startsWith("root['operation_emission_summary']"),
  );

  const otherChanges = filteredChanges.filter(
    (change) =>
      !change.field.includes("['facility_reports']") &&
      !change.field.startsWith("root['report_compliance_summary']") &&
      !change.field.startsWith("root['report_electricity_import_data']") &&
      !change.field.startsWith("root['report_new_entrant']") &&
      !change.field.startsWith("root['report_information']") &&
      !change.field.includes("['report_operation_information']") &&
      !change.field.includes("['reporting_window_start']") &&
      !change.field.includes("['reporting_window_end']") &&
      !change.field.includes("['report_type']") &&
      !change.field.startsWith("root['operation_emission_summary']"),
  );

  const sectioned: Record<string, any[]> = {};
  otherChanges.forEach((change) => {
    const section = getSection(change.field);
    if (!sectioned[section]) sectioned[section] = [];
    sectioned[section].push(change);
  });

  const modifiedFacilityReportsWithAddedActivities: Record<string, any[]> = {};
  const modifiedFacilityReportsWithDeletedActivities: Record<string, any[]> =
    {};
  const sourceTypeChanges: SourceTypeChange[] = [];

  facilityReportChanges.forEach((change) => {
    const activityChangesResult =
      detectActivityChangesInModifiedFacility(change);
    if (activityChangesResult) {
      if (activityChangesResult.addedActivities?.length) {
        modifiedFacilityReportsWithAddedActivities[
          activityChangesResult.facilityName
        ] = activityChangesResult.addedActivities;
      }
      if (activityChangesResult.removedActivities?.length) {
        modifiedFacilityReportsWithDeletedActivities[
          activityChangesResult.facilityName
        ] = activityChangesResult.removedActivities;
      }
    }
    const sourceTypeChangeResults = detectSourceTypeChanges(change);
    if (sourceTypeChangeResults.length > 0) {
      sourceTypeChanges.push(...sourceTypeChangeResults);
    }
  });

  const organizedFacilityReports = organizeFacilityReportChanges(
    facilityReportChanges,
  );

  const bulkFacilityChanges = facilityReportChanges.filter(
    (change) =>
      change.field === "root['facility_reports']" &&
      change.change_type === "modified",
  );

  const isRecord = (value: any): value is Record<string, any> => {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  };

  return (
    <Box>
      {/* Report Information Section */}
      {reportInformationChanges.length > 0 && (
        <Box mb={4}>
          <Typography className="form-heading text-xl font-bold flex items-center text-bc-bg-blue">
            Report Information
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {reportInformationChanges.map((item, idx) => (
            <ChangeItemDisplay key={item.field + idx} item={item} />
          ))}
        </Box>
      )}

      {/* Render other sections - exclude only "Other" section */}
      {Object.entries(sectioned).map(([section, items]) => {
        if (items.length === 0 || section === "Other") return null;

        const processedItems =
          section === "Person Responsible"
            ? groupPersonResponsibleChanges(items)
            : items;

        return (
          <Box key={section} mb={4}>
            <Typography className="form-heading text-xl font-bold flex items-center text-bc-bg-blue">
              {section}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {processedItems.map((item, idx) => (
              <ChangeItemDisplay key={item.field + idx} item={item} />
            ))}
          </Box>
        );
      })}

      {/* Render Facility Reports with Source Type Changes */}
      {Object.entries(organizedFacilityReports).map(
        ([facilityName, facilityData]) => (
          <Box key={facilityName} mb={4}>
            <FacilityReportChanges
              facilityName={facilityName}
              facilityData={facilityData}
              addedActivities={
                modifiedFacilityReportsWithAddedActivities[facilityName]
              }
              deletedActivities={
                modifiedFacilityReportsWithDeletedActivities[facilityName]
              }
              sourceTypeChanges={sourceTypeChanges.filter(
                (change) => change.facilityName === facilityName,
              )}
            />
          </Box>
        ),
      )}

      {/* Handle bulk facility changes using FacilityReportChanges component */}
      {bulkFacilityChanges.map((change, idx) => {
        const oldFacilities = isRecord(change.old_value)
          ? change.old_value
          : {};
        const newFacilities = isRecord(change.new_value)
          ? change.new_value
          : {};

        const allFacilityNames = new Set([
          ...Object.keys(oldFacilities),
          ...Object.keys(newFacilities),
        ]);

        return Array.from(allFacilityNames).map((facilityName) => {
          const oldFacility = oldFacilities[facilityName];
          const newFacility = newFacilities[facilityName];

          const modifiedFacilityData = {
            field: `facility_reports.${facilityName}`,
            old_value: { [facilityName]: oldFacility },
            new_value: { [facilityName]: newFacility },
            change_type: "modified" as const,
          };

          return (
            <Box key={`bulk-${facilityName}-${idx}`} mb={4}>
              <FacilityReportChanges
                facilityName={facilityName}
                facilityData={{
                  facilityName,
                  activities: {},
                  emissionSummary: [],
                  productionData: [],
                  emissionAllocation: [],
                  nonAttributableEmissions: [],
                }}
                modifiedFacilityData={modifiedFacilityData}
                addedActivities={
                  modifiedFacilityReportsWithAddedActivities[facilityName]
                }
                deletedActivities={
                  modifiedFacilityReportsWithDeletedActivities[facilityName]
                }
                sourceTypeChanges={sourceTypeChanges.filter(
                  (sourceTypeChange) =>
                    sourceTypeChange.facilityName === facilityName,
                )}
              />
            </Box>
          );
        });
      })}

      {/* New Entrant Information */}
      {newEntrantChanges.length > 0 && (
        <NewEntrantChanges changes={newEntrantChanges} />
      )}

      {/* Electricity Import Data */}
      {electricityImportChanges.length > 0 && (
        <ElectricityImportData changes={electricityImportChanges} />
      )}

      {/* Operation Emission Summary */}
      {operationEmissionSummaryChanges.length > 0 && (
        <OperationEmissionSummary changes={operationEmissionSummaryChanges} />
      )}

      {/* Compliance Summary */}
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

export default ReviewChanges;
