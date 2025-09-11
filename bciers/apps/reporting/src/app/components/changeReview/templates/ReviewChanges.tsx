import React from "react";
import { Box, Typography, Divider } from "@mui/material";
import { ReviewChangesProps, SourceTypeChange } from "../constants/types";
import { ChangeItemDisplay } from "./ChangeItemDisplay";
import { FacilityReportChanges } from "./FacilityReportChanges";
import { organizeFacilityReportChanges } from "./facilityReportOrganizer";
import {
  detectActivityChangesInModifiedFacility,
  detectSourceTypeChanges,
} from "./facilityReportParser";
import {
  filterExcludedFields,
  getSection,
  groupPersonResponsibleChanges,
  normalizeChangeKeys,
} from "../utils/utils";
import OperationEmissionSummary from "./OperationEmissionSummary";
import ElectricityImportData from "./ElectricityImportData";
import NewEntrantChanges from "./NewEntrantChanges";
import AdditionalReportingData from "@reporting/src/app/components/changeReview/templates/AdditionalReportingData";
import ComplianceSummary from "@reporting/src/app/components/changeReview/templates/ComplianceSummary";
import {
  complianceNote,
  reviewChangesNote,
} from "@reporting/src/data/jsonSchema/changeReview/complianceNote";
import { ReportingFlow } from "@reporting/src/app/components/taskList/types";

export const ReviewChanges: React.FC<ReviewChangesProps> = ({
  changes,
  flow,
}) => {
  // Normalize keys for all changes at the root level
  const normalizedChanges = normalizeChangeKeys(filterExcludedFields(changes));
  const showChangesFlows = [
    ReportingFlow.SFO,
    ReportingFlow.LFO,
    ReportingFlow.OptedInSFO,
    ReportingFlow.OptedInLFO,
  ];

  const reportingOnlyFlows = [
    ReportingFlow.ReportingOnlySFO,
    ReportingFlow.ReportingOnlyLFO,
  ];

  const showChanges = showChangesFlows.includes(flow);
  const isReportingOnly = reportingOnlyFlows.includes(flow);

  // Helper to filter changes by field prefix or inclusion
  const filterByField = (prefixes: string[], includes: string[] = []) =>
    normalizedChanges.filter(
      (c: { field: string }) =>
        prefixes.some((p) => c.field.startsWith(p)) ||
        includes.some((inc) => c.field.includes(inc)),
    );

  // Filter Person Responsible changes, ignore trivial ones like report_version
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

  const reportInformationChanges = filterByField(
    ["root['report_information']"],
    [
      "['report_operation_information']",
      "['reporting_window_start']",
      "['reporting_window_end']",
      "['report_type']",
    ],
  );

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
        ...reportInformationChanges,
        ...operationEmissionSummaryChanges,
      ].includes(c),
  );

  // Organize other changes into sections
  const sectioned: Record<string, any[]> = {};
  otherChanges.forEach((change: any) => {
    const section = getSection(change.field);
    if (!sectioned[section]) sectioned[section] = [];
    sectioned[section].push(change);
  });

  const modifiedFacilityReportsWithAddedActivities: Record<string, any[]> = {};
  const modifiedFacilityReportsWithDeletedActivities: Record<string, any[]> =
    {};
  const sourceTypeChanges: SourceTypeChange[] = [];

  facilityReportChanges.forEach((change: any) => {
    const activityResult = detectActivityChangesInModifiedFacility(change);
    if (activityResult) {
      const { facilityName, addedActivities, removedActivities } =
        activityResult;

      if (addedActivities?.length) {
        if (!modifiedFacilityReportsWithAddedActivities[facilityName])
          modifiedFacilityReportsWithAddedActivities[facilityName] = [];

        addedActivities.forEach((activity) => {
          const exists = modifiedFacilityReportsWithAddedActivities[
            facilityName
          ].some((a) => a.activity === activity.activity);
          if (!exists) {
            modifiedFacilityReportsWithAddedActivities[facilityName].push(
              structuredClone(activity),
            );
          }
        });
      }

      if (removedActivities?.length) {
        if (!modifiedFacilityReportsWithDeletedActivities[facilityName])
          modifiedFacilityReportsWithDeletedActivities[facilityName] = [];

        modifiedFacilityReportsWithDeletedActivities[facilityName].push(
          ...structuredClone(removedActivities),
        );
      }
    }

    const sourceTypeResult = detectSourceTypeChanges(change);
    if (sourceTypeResult.length) sourceTypeChanges.push(...sourceTypeResult);
  });

  const organizedFacilityReports = organizeFacilityReportChanges(
    facilityReportChanges,
  );

  const bulkFacilityChanges = facilityReportChanges.filter(
    (c: any) =>
      c.field === "root['facility_reports']" && c.change_type === "modified",
  );

  const isRecord = (value: any): value is Record<string, any> =>
    typeof value === "object" && value !== null && !Array.isArray(value);
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
        {processedItems.map((item, idx) => (
          <ChangeItemDisplay key={item.field + idx} item={item} />
        ))}
      </Box>
    );
  };

  const reportOperationItems = sectioned["Report Operation"] || [];
  return (
    <Box>
      <div className="form-heading text-xl font-bold flex items-cente">
        Review Changes
      </div>
      <div className="form-group w-full my-8">
        {showChanges ? complianceNote : reviewChangesNote}
      </div>
      {renderSection("Review Operation Information", reportOperationItems)}
      {renderSection("Person Responsible", personResponsibleItems, true)}

      {/* Facility Reports */}
      {Object.entries(organizedFacilityReports).map(
        ([facilityName, facilityData]: [string, any]) => {
          // Get added and deleted activities for this facility
          const addedActivities =
            modifiedFacilityReportsWithAddedActivities[facilityName] || [];
          const deletedActivities =
            modifiedFacilityReportsWithDeletedActivities[facilityName] || [];

          // Ensure facilityData does not include added or deleted activities
          const cleanFacilityData = {
            ...facilityData, // Keep the rest of the core data
            activities: facilityData.activities, // Explicitly include the activities (assuming they are part of core data)
            // Do not include addedActivities and deletedActivities here
          };

          return (
            <Box key={facilityName} mb={4}>
              <FacilityReportChanges
                facilityName={facilityName}
                facilityData={cleanFacilityData} // Pass clean data (without added/deleted activities)
                addedActivities={addedActivities} // Pass added activities separately
                deletedActivities={deletedActivities} // Pass deleted activities separately
                sourceTypeChanges={sourceTypeChanges.filter(
                  (c) => c.facilityName === facilityName,
                )}
                isReportingOnly={isReportingOnly}
              />
            </Box>
          );
        },
      )}
      {/* Bulk Facility Changes */}
      {bulkFacilityChanges.map((change: any, idx: number) => {
        const oldFacilities = isRecord(change.oldValue) ? change.oldValue : {};
        const newFacilities = isRecord(change.newValue) ? change.newValue : {};

        return Array.from(
          new Set([
            ...Object.keys(oldFacilities),
            ...Object.keys(newFacilities),
          ]),
        ).map((facilityName: string) => (
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
                facilityNameChange: {
                  field: "",
                  oldValue: null,
                  newValue: null,
                  change_type: "modified",
                },
              }}
              modifiedFacilityData={{
                field: `facility_reports.${facilityName}`,
                oldValue: {
                  [facilityName]: (oldFacilities as Record<string, any>)[
                    facilityName
                  ],
                },
                newValue: {
                  [facilityName]: (newFacilities as Record<string, any>)[
                    facilityName
                  ],
                },
                change_type: "modified",
              }}
              addedActivities={
                modifiedFacilityReportsWithAddedActivities[facilityName]
              }
              deletedActivities={
                modifiedFacilityReportsWithDeletedActivities[facilityName]
              }
              sourceTypeChanges={sourceTypeChanges.filter(
                (c) => c.facilityName === facilityName,
              )}
              isReportingOnly={isReportingOnly}
            />
          </Box>
        ));
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
