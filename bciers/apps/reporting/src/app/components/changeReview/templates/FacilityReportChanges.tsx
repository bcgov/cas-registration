import React from "react";
import { Box } from "@mui/material";
import { StatusLabel } from "@bciers/components/form/fields/StatusLabel";
import { FacilityReportStructure } from "../constants/types";
import { FacilityReportSection } from "../../shared/FacilityReportSection";
import { SectionReview } from "@reporting/src/app/components/finalReview/templates/SectionReview";
import { SourceTypeChange } from "./facilityReportParser";
import { FieldDisplay } from "@reporting/src/app/components/finalReview/templates/FieldDisplay";
import { EmissionAllocationChangeView } from "./EmissionAllocationChangeView";
import { EmissionSummaryChangeView } from "./EmissionSummaryChangeView";
import { ProductionDataChangeView } from "./ProductionDataChangeView";
import { ActivityDataChangeView } from "./ActivityDataChangeView";
import { ChangeItemDisplay } from "@reporting/src/app/components/changeReview/templates/ChangeItemDisplay";

interface ModifiedFacilityData {
  field: string;
  old_value: Record<string, any>;
  new_value: Record<string, any>;
  change_type: "modified";
}

interface FacilityReportChangesProps {
  facilityName: string;
  facilityData: FacilityReportStructure;
  addedActivities?: any[];
  deletedActivities?: any[];
  sourceTypeChanges?: SourceTypeChange[];
  modifiedFacilityData?: ModifiedFacilityData;
}

interface NonAttributableEmission {
  new_value: string | Record<string, any> | null;
  old_value?: string | Record<string, any> | null;
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
      typeof change.old_value === "object" && change.old_value !== null
        ? change.old_value[key]
        : change.old_value,
  };
}

export const FacilityReportChanges: React.FC<FacilityReportChangesProps> = ({
  facilityName,
  facilityData,
  addedActivities,
  deletedActivities,
  sourceTypeChanges = [],
  modifiedFacilityData,
}) => {
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
                (sourceTypeData.old_value === null ||
                  sourceTypeData.old_value === undefined) &&
                sourceTypeData.new_value !== null &&
                sourceTypeData.new_value !== undefined
              ) {
                addedSourceTypes.push({
                  facilityName,
                  activityName,
                  sourceTypeName,
                  changeType: "added",
                  newValue: sourceTypeData.new_value,
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
  if (isFacilityModified && !modifiedFacilityData) {
    return (
      <Box>
        <SectionReview
          title={`Report Information - ${facilityName}`}
          fields={[]}
          data={{}}
          expandable={true}
        >
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
          {facilityData.productionData.length > 0 && (
            <Box mb={3}>
              <ProductionDataChangeView data={facilityData.productionData} />
            </Box>
          )}

          {/* Emission Allocation Changes */}
          {facilityData.emissionAllocation.length > 0 && (
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
                          typeof change.old_value === "object" &&
                          change.old_value !== null
                            ? change.old_value
                            : {};
                        const newObj =
                          typeof change.new_value === "object" &&
                          change.new_value !== null
                            ? change.new_value
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
                                    old_value: oldObj[key] ?? null,
                                    new_value: newObj[key] ?? null,
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
                          ? typeof change.old_value === "object" &&
                            change.old_value !== null
                            ? change.old_value
                            : {}
                          : typeof change.new_value === "object" &&
                            change.new_value !== null
                          ? change.new_value
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
