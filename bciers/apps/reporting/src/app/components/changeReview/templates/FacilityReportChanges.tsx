import React from "react";
import { Box } from "@mui/material";
import { StatusLabel } from "@bciers/components/form/fields/StatusLabel";
import { FacilityReportStructure, SourceTypeChange } from "../constants/types";
import { FacilityReportSection } from "../../shared/FacilityReportSection";
import { SectionReview } from "@reporting/src/app/components/finalReview/templates/SectionReview";
import { FieldDisplay } from "@reporting/src/app/components/finalReview/templates/FieldDisplay";
import { EmissionAllocationChangeView } from "./EmissionAllocationChangeView";
import { EmissionSummaryChangeView } from "./EmissionSummaryChangeView";
import { ProductionDataChangeView } from "./ProductionDataChangeView";
import { ActivityDataChangeView } from "./ActivityDataChangeView";
import { ChangeItemDisplay } from "@reporting/src/app/components/changeReview/templates/ChangeItemDisplay";

interface ModifiedFacilityData {
  field: string;
  oldValue: Record<string, any>;
  newValue: Record<string, any>;
  change_type: "modified";
}

interface FacilityReportChangesProps {
  facilityName: string;
  facilityData: FacilityReportStructure;
  addedActivities?: any[];
  deletedActivities?: any[];
  sourceTypeChanges?: SourceTypeChange[];
  modifiedFacilityData?: ModifiedFacilityData;
  isReportingOnly?: boolean;
}

interface NonAttributableEmission {
  newValue: string | Record<string, any> | null;
  oldValue?: string | Record<string, any> | null;
  change_type?: string;
}

const nonAttributableEmissionLabels: Record<string, string> = {
  activity: "Activity Name",
  source_type: "Source Type",
  emission_category: "Emission Category",
  gas_type: "Gas Type",
};

// Helper function to get FieldDisplay props for non-attributable emission changes
function getFieldDisplayProps(
  change: NonAttributableEmission,
  key: string,
  value: any,
) {
  const isDeleted =
    change.change_type === "deleted" || change.change_type === "removed";
  return {
    label: nonAttributableEmissionLabels[key] || key,
    value,
    isAdded: change.change_type === "added",
    isDeleted,
    oldValue:
      typeof change.oldValue === "object" && change.oldValue !== null
        ? change.oldValue[key]
        : change.oldValue,
  };
}

export const FacilityReportChanges: React.FC<FacilityReportChangesProps> = ({
  facilityName,
  facilityData,
  addedActivities,
  deletedActivities,
  sourceTypeChanges = [],
  modifiedFacilityData,
  isReportingOnly = false,
}) => {
  // Detect added source types from activities
  const detectAddedSourceTypes = (): SourceTypeChange[] => {
    const addedSourceTypes: SourceTypeChange[] = [];

    Object.entries(facilityData.activities).forEach(
      ([activityName, activity]) => {
        if (
          activity &&
          typeof activity === "object" &&
          "sourceTypes" in activity
        ) {
          const sourceTypes = activity.sourceTypes as Record<string, any>;
          Object.entries(sourceTypes).forEach(
            ([sourceTypeName, sourceTypeData]) => {
              if (
                sourceTypeData &&
                (sourceTypeData.oldValue === null ||
                  sourceTypeData.oldValue === undefined) &&
                sourceTypeData.newValue !== null &&
                sourceTypeData.newValue !== undefined
              ) {
                addedSourceTypes.push({
                  fields: "",
                  facilityName,
                  activityName,
                  sourceTypeName,
                  changeType: "added",
                  newValue: sourceTypeData.newValue,
                  oldValue: null,
                });
              }
            },
          );
        }
      },
    );

    return addedSourceTypes;
  };

  const allSourceTypeChanges = [
    ...sourceTypeChanges,
    ...detectAddedSourceTypes(),
  ];

  // Check if this is a modified facility (has changes but not added/removed)
  const isFacilityModified =
    !facilityData.isFacilityAdded &&
    !facilityData.isFacilityRemoved &&
    (Object.keys(facilityData.activities).length > 0 ||
      facilityData.emissionSummary.length > 0 ||
      facilityData.productionData.length > 0 ||
      facilityData.emissionAllocation.length > 0 ||
      facilityData.nonAttributableEmissions.length > 0 ||
      facilityData.facilityNameChange ||
      (addedActivities && addedActivities.length > 0));

  // Handle facility-level additions/removals
  if (facilityData.isFacilityAdded) {
    return (
      <FacilityReportSection
        facilityName={facilityName}
        facilityData={facilityData.facilityData}
        isAdded={true}
        showReportingOnlyConditions={true}
      />
    );
  }

  if (facilityData.isFacilityRemoved) {
    return (
      <FacilityReportSection
        facilityName={facilityName}
        facilityData={facilityData.facilityData}
        isRemoved={true}
        showReportingOnlyConditions={true}
      />
    );
  }

  // Handle modified facility with various changes
  if (isFacilityModified) {
    return (
      <Box>
        <SectionReview
          title={`Report Information - ${facilityName}`}
          fields={[]}
          data={{}}
          expandable={true}
        >
          {/* Facility Name Change */}
          {(facilityData.facilityNameChange || modifiedFacilityData) && (
            <Box ml={2}>
              {facilityData?.facilityNameChange &&
                facilityData?.facilityNameChange?.newValue !== null && (
                  <ChangeItemDisplay
                    item={{
                      field: "facility_name",
                      displayLabel: "Facility Name",
                      oldValue: facilityData.facilityNameChange.oldValue,
                      newValue: facilityData.facilityNameChange.newValue,
                      change_type: facilityData.facilityNameChange.change_type,
                    }}
                  />
                )}
              {modifiedFacilityData && !facilityData.facilityNameChange && (
                <ChangeItemDisplay
                  item={{
                    ...modifiedFacilityData,
                    displayLabel: "Facility Information",
                  }}
                />
              )}
            </Box>
          )}

          {/* Activity Data Changes */}
          {Object.keys(facilityData.activities).length > 0 && (
            <Box mb={3}>
              <ActivityDataChangeView
                activities={facilityData.activities}
                addedActivities={addedActivities}
                deletedActivities={deletedActivities}
                sourceTypeChanges={allSourceTypeChanges}
              />
            </Box>
          )}

          {/* Emission Summary Changes */}
          {facilityData.emissionSummary.length > 0 && (
            <Box mb={3}>
              <EmissionSummaryChangeView data={facilityData.emissionSummary} />
            </Box>
          )}

          {/* Production Data Changes */}
          {!isReportingOnly && facilityData.productionData.length > 0 && (
            <Box mb={3}>
              <ProductionDataChangeView data={facilityData.productionData} />
            </Box>
          )}

          {/* Emission Allocation Changes */}
          {!isReportingOnly && facilityData.emissionAllocation.length > 0 && (
            <Box mb={3}>
              <EmissionAllocationChangeView
                data={facilityData.emissionAllocation}
              />
            </Box>
          )}

          {/* Non-Attributable Emissions Changes */}
          {facilityData.nonAttributableEmissions.length > 0 && (
            <Box mb={3}>
              <SectionReview
                title="Non-Attributable Emissions"
                data={{}}
                fields={[]}
              >
                <Box ml={2}>
                  <FieldDisplay
                    label="Did your non-attributable emissions exceed 100 tCO2e?"
                    value={facilityData.nonAttributableEmissions.length > 0}
                  />
                  {facilityData.nonAttributableEmissions.map(
                    (change: NonAttributableEmission, index: number) => {
                      if (change.change_type === "modified") {
                        // Get all unique keys from old and new value
                        const oldObj =
                          typeof change.oldValue === "object" &&
                          change.oldValue !== null
                            ? change.oldValue
                            : {};
                        const newObj =
                          typeof change.newValue === "object" &&
                          change.newValue !== null
                            ? change.newValue
                            : {};
                        const keys = Array.from(
                          new Set([
                            ...Object.keys(oldObj),
                            ...Object.keys(newObj),
                          ]),
                        );
                        return (
                          <Box key={index} mb={2}>
                            {keys
                              .filter((key) => oldObj[key] !== newObj[key])
                              .map((key) => (
                                <ChangeItemDisplay
                                  key={key}
                                  item={{
                                    field: key,
                                    displayLabel:
                                      nonAttributableEmissionLabels[key] || key,
                                    oldValue: oldObj[key] ?? null,
                                    newValue: newObj[key] ?? null,
                                    change_type: "modified",
                                  }}
                                />
                              ))}
                            {index <
                              facilityData.nonAttributableEmissions.length -
                                1 && <hr className="my-4" />}
                          </Box>
                        );
                      }
                      // ...handle added/deleted/removed as before
                      const valueObj =
                        change.change_type === "removed" ||
                        change.change_type === "deleted"
                          ? typeof change.oldValue === "object" &&
                            change.oldValue !== null
                            ? change.oldValue
                            : {}
                          : typeof change.newValue === "object" &&
                            change.newValue !== null
                          ? change.newValue
                          : {};
                      return (
                        <Box key={index} mb={2}>
                          {change.change_type && (
                            <StatusLabel
                              type={
                                change.change_type === "deleted" ||
                                change.change_type === "removed"
                                  ? "deleted"
                                  : change.change_type === "added"
                                  ? "added"
                                  : "modified"
                              }
                            />
                          )}
                          {Object.entries(valueObj).map(([key, value]) => (
                            <FieldDisplay
                              key={key}
                              {...getFieldDisplayProps(change, key, value)}
                            />
                          ))}
                          {index <
                            facilityData.nonAttributableEmissions.length -
                              1 && <hr className="my-4" />}
                        </Box>
                      );
                    },
                  )}
                </Box>
              </SectionReview>
            </Box>
          )}
        </SectionReview>
      </Box>
    );
  }

  return null;
};
