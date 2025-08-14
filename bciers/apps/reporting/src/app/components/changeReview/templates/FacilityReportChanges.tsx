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

    if (addedActivities) {
      addedActivities.forEach((activity) => {
        if (activity.source_types) {
          Object.entries(activity.source_types).forEach(
            ([sourceTypeName, sourceTypeData]) => {
              addedSourceTypes.push({
                facilityName,
                activityName: activity.activity || activity.name,
                sourceTypeName,
                changeType: "added",
                newValue: sourceTypeData,
                oldValue: null,
              });
            },
          );
        }
      });
    }

    return addedSourceTypes;
  };

  const allSourceTypeChanges = [
    ...sourceTypeChanges,
    ...detectAddedSourceTypes(),
  ];

  if (modifiedFacilityData && modifiedFacilityData.change_type === "modified") {
    const oldFacilityData = Object.values(
      modifiedFacilityData.old_value,
    )[0] as any;
    const newFacilityData = Object.values(
      modifiedFacilityData.new_value,
    )[0] as any;

    const actualFacilityName = newFacilityData?.facility_name || facilityName;

    const prepareActivityData = () => {
      const oldActivities = oldFacilityData?.activity_data || {};
      const newActivities = newFacilityData?.activity_data || {};

      const allActivityNames = new Set([
        ...Object.keys(oldActivities),
        ...Object.keys(newActivities),
      ]);
      const activityChanges: any[] = [];

      allActivityNames.forEach((activityName) => {
        const oldActivity = oldActivities[activityName];
        const newActivity = newActivities[activityName];

        if (!oldActivity && newActivity) {
          // Added activity
          activityChanges.push({
            activity: activityName,
            ...newActivity,
            change_type: "added",
          });
        } else if (oldActivity && !newActivity) {
          const keys = Object.keys(oldActivity).filter(
            (key) => key !== "activity" && key !== "change_type",
          );
          const hasValidData = keys.some((key) => {
            const value = oldActivity[key];
            if (Array.isArray(value)) return value.length > 0;
            if (typeof value === "object" && value !== null)
              return Object.keys(value).length > 0;
            return value !== undefined && value !== null && value !== "";
          });
          if (hasValidData) {
            activityChanges.push({
              activity: activityName,
              ...oldActivity,
              change_type: "deleted",
            });
          }
        } else if (oldActivity && newActivity) {
          // Modified activity - pass both old and new for comparison
          activityChanges.push({
            activity: activityName,
            old_value: oldActivity,
            new_value: newActivity,
            change_type: "modified",
          });
        }
      });

      return activityChanges;
    };

    const prepareEmissionSummaryData = () => {
      const oldSummary = oldFacilityData?.emission_summary;
      const newSummary = newFacilityData?.emission_summary;

      // Avoid variable shadowing by renaming local variables
      const localFacilityName =
        newFacilityData?.facility_name || oldFacilityData?.facility_name || "";
      const localDeletedActivities: any[] = [];

      if (!oldSummary && !newSummary) return [];
      if (!oldSummary && newSummary)
        return [
          {
            field: "emission_summary",
            old_value: null,
            new_value: newSummary,
            change_type: "added",
            facilityName: localFacilityName,
            deletedActivities: localDeletedActivities,
          },
        ];
      if (oldSummary && !newSummary)
        return [
          {
            field: "emission_summary",
            old_value: oldSummary,
            new_value: null,
            change_type: "deleted",
            facilityName: localFacilityName,
            deletedActivities: localDeletedActivities,
          },
        ];

      // Compare old and new emission summaries
      return [
        {
          field: "emission_summary",
          old_value: oldSummary,
          new_value: newSummary,
          change_type: "modified",
          facilityName: localFacilityName,
          deletedActivities: localDeletedActivities,
        },
      ];
    };

    const prepareProductionData = () => {
      const oldProducts = oldFacilityData?.report_products || {};
      const newProducts = newFacilityData?.report_products || {};

      const allProductNames = new Set([
        ...Object.keys(oldProducts),
        ...Object.keys(newProducts),
      ]);
      const productChanges: any[] = [];

      allProductNames.forEach((productName) => {
        const oldProduct = oldProducts[productName];
        const newProduct = newProducts[productName];

        if (!oldProduct && newProduct) {
          productChanges.push({
            old_value: null,
            new_value: { [productName]: newProduct },
            change_type: "added",
          });
        } else if (oldProduct && !newProduct) {
          productChanges.push({
            old_value: { [productName]: oldProduct },
            new_value: null,
            change_type: "deleted",
          });
        } else if (oldProduct && newProduct) {
          productChanges.push({
            old_value: { [productName]: oldProduct },
            new_value: { [productName]: newProduct },
            change_type: "modified",
          });
        }
      });

      return productChanges;
    };

    const prepareEmissionAllocationData = () => {
      const oldAllocation = oldFacilityData?.report_emission_allocation;
      const newAllocation = newFacilityData?.report_emission_allocation;

      const allocationChanges: any[] = [];

      // Handle main allocation data
      if (!oldAllocation && newAllocation) {
        allocationChanges.push({
          field: "report_emission_allocation",
          old_value: null,
          new_value: newAllocation,
          change_type: "added",
        });
      } else if (oldAllocation && !newAllocation) {
        allocationChanges.push({
          field: "report_emission_allocation",
          old_value: oldAllocation,
          new_value: null,
          change_type: "deleted",
        });
      } else if (oldAllocation && newAllocation) {
        const oldAllocations =
          oldAllocation.report_product_emission_allocations || [];
        const newAllocations =
          newAllocation.report_product_emission_allocations || [];

        const maxLength = Math.max(
          oldAllocations.length,
          newAllocations.length,
        );
        for (let i = 0; i < maxLength; i++) {
          const oldItem = oldAllocations[i] || null;
          const newItem = newAllocations[i] || null;

          if (!oldItem && newItem) {
            allocationChanges.push({
              field: `root['facility_reports']['${actualFacilityName}']['report_emission_allocation']['report_product_emission_allocations'][${i}]`,
              old_value: null,
              new_value: newItem,
              change_type: "added",
            });
          } else if (oldItem && !newItem) {
            allocationChanges.push({
              field: `root['facility_reports']['${actualFacilityName}']['report_emission_allocation']['report_product_emission_allocations'][${i}]`,
              old_value: oldItem,
              new_value: null,
              change_type: "deleted",
            });
          } else if (
            oldItem &&
            newItem &&
            JSON.stringify(oldItem) !== JSON.stringify(newItem)
          ) {
            allocationChanges.push({
              field: `root['facility_reports']['${actualFacilityName}']['report_emission_allocation']['report_product_emission_allocations'][${i}]`,
              old_value: oldItem,
              new_value: newItem,
              change_type: "modified",
            });
          }
        }

        // Handle Report Product Emission Allocation Totals
        const oldTotals =
          oldAllocation.report_product_emission_allocation_totals || [];
        const newTotals =
          newAllocation.report_product_emission_allocation_totals || [];

        // Compare each total item
        const maxTotalsLength = Math.max(oldTotals.length, newTotals.length);
        for (let i = 0; i < maxTotalsLength; i++) {
          const oldTotal = oldTotals[i] || null;
          const newTotal = newTotals[i] || null;

          if (!oldTotal && newTotal) {
            allocationChanges.push({
              field: `Report Product Emission Allocation Totals[${i}]`,
              old_value: null,
              new_value: newTotal,
              change_type: "added",
            });
          } else if (oldTotal && !newTotal) {
            allocationChanges.push({
              field: `Report Product Emission Allocation Totals[${i}]`,
              old_value: oldTotal,
              new_value: null,
              change_type: "deleted",
            });
          } else if (
            oldTotal &&
            newTotal &&
            JSON.stringify(oldTotal) !== JSON.stringify(newTotal)
          ) {
            allocationChanges.push({
              field: `Report Product Emission Allocation Totals[${i}]`,
              old_value: oldTotal,
              new_value: newTotal,
              change_type: "modified",
            });
          }
        }
      }

      return allocationChanges;
    };

    const prepareNonAttributableEmissionsData = () => {
      const oldEmissions =
        oldFacilityData?.reportnonattributableemissions_records || [];
      const newEmissions =
        newFacilityData?.reportnonattributableemissions_records || [];

      // Simple comparison - you might want to make this more sophisticated
      if (oldEmissions.length === 0 && newEmissions.length > 0) {
        return newEmissions.map((emission: any) => ({
          old_value: null,
          new_value: emission,
          change_type: "added",
        }));
      } else if (oldEmissions.length > 0 && newEmissions.length === 0) {
        return oldEmissions.map((emission: any) => ({
          old_value: emission,
          new_value: null,
          change_type: "deleted",
        }));
      } else if (
        oldEmissions.length !== newEmissions.length ||
        JSON.stringify(oldEmissions) !== JSON.stringify(newEmissions)
      ) {
        return newEmissions.map((emission: any, index: number) => ({
          old_value: oldEmissions[index] || null,
          new_value: emission,
          change_type: oldEmissions[index] ? "modified" : "added",
        }));
      }

      return [];
    };

    const activityData = prepareActivityData();
    const emissionSummaryData = prepareEmissionSummaryData();
    const productionData = prepareProductionData();
    const emissionAllocationData = prepareEmissionAllocationData();
    const nonAttributableEmissionsData = prepareNonAttributableEmissionsData();

    return (
      <Box>
        <SectionReview
          title={`Report Information - ${actualFacilityName}`}
          fields={[]}
          data={{}}
          expandable={true}
        >
          {/* Activity Data Changes */}
          {activityData.length > 0 && (
            <Box mb={4}>
              <ActivityDataChangeView
                activities={{}}
                addedActivities={activityData.filter(
                  (a) => a.change_type === "added",
                )}
                sourceTypeChanges={[]}
                modifiedActivities={activityData.filter(
                  (a) => a.change_type === "modified",
                )}
                deletedActivities={activityData.filter(
                  (a) => a.change_type === "deleted",
                )}
              />
            </Box>
          )}

          {/* Emission Summary Changes */}
          {emissionSummaryData.length > 0 && (
            <Box mb={3}>
              <EmissionSummaryChangeView data={emissionSummaryData} />
            </Box>
          )}

          {/* Production Data Changes */}
          {productionData.length > 0 && (
            <Box mb={3}>
              <ProductionDataChangeView data={productionData} />
            </Box>
          )}

          {/* Emission Allocation Changes */}
          {emissionAllocationData.length > 0 && (
            <Box mb={3}>
              <EmissionAllocationChangeView data={emissionAllocationData} />
            </Box>
          )}

          {/* Non-Attributable Emissions Changes */}
          {nonAttributableEmissionsData.length > 0 && (
            <Box mb={3}>
              <SectionReview
                title="Non-Attributable Emissions"
                data={{}}
                fields={[]}
              >
                <Box ml={2}>
                  <FieldDisplay
                    label="Did your non-attributable emissions exceed 100 tCO2e?"
                    value={nonAttributableEmissionsData.length > 0}
                  />
                  {nonAttributableEmissionsData.map(
                    (change: any, index: number) => (
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
                        {/* For removed/deleted items, show old_value. For others, show new_value */}
                        {Object.entries(
                          change.change_type === "removed" ||
                            change.change_type === "deleted"
                            ? change.old_value || {}
                            : change.new_value || {},
                        ).map(([key, value]) => (
                          <FieldDisplay
                            key={key}
                            label={nonAttributableEmissionLabels[key] || key}
                            value={value}
                            isAdded={change.change_type === "added"}
                            isDeleted={
                              change.change_type === "deleted" ||
                              change.change_type === "removed"
                            }
                            oldValue={
                              typeof change.old_value === "object" &&
                              change.old_value !== null
                                ? change.old_value[key]
                                : change.old_value
                            }
                          />
                        ))}
                        {index < nonAttributableEmissionsData.length - 1 && (
                          <hr className="my-4" />
                        )}
                      </Box>
                    ),
                  )}
                </Box>
              </SectionReview>
            </Box>
          )}
        </SectionReview>
      </Box>
    );
  }

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
          {(Object.keys(facilityData.activities).length > 0 ||
            (addedActivities && addedActivities.length > 0) ||
            (deletedActivities && deletedActivities.length > 0)) && (
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
                    (change: NonAttributableEmission, index: number) => (
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
                        {/* For removed/deleted items, show old_value. For others, show new_value */}
                        {Object.entries(
                          change.change_type === "removed" ||
                            change.change_type === "deleted"
                            ? change.old_value || {}
                            : change.new_value || {},
                        ).map(([key, value]) => (
                          <FieldDisplay
                            key={key}
                            {...getFieldDisplayProps(change, key, value)}
                          />
                        ))}
                        {index <
                          facilityData.nonAttributableEmissions.length - 1 && (
                          <hr className="my-4" />
                        )}
                      </Box>
                    ),
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
