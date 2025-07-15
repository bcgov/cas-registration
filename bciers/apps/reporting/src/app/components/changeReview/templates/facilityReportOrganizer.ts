import { ChangeItem, FacilityReportStructure } from "../constants/types";
import { parseFacilityReportField } from "./facilityReportParser";

function handleFuelsData(
  unit: any,
  fuelsData: any[],
  change: ChangeItem,
  sourceTypeName: string,
  unitIndex: number,
) {
  fuelsData.forEach((fuelData: any, fuelIndex: number) => {
    if (!unit.fuels[fuelIndex]) {
      unit.fuels[fuelIndex] = {
        fuelIndex,
        fields: [],
        emissions: {},
      };
    }

    const fuel = unit.fuels[fuelIndex];

    // Add fuel-level fields
    Object.entries(fuelData).forEach(([key, value]) => {
      if (key !== "emissions") {
        fuel.fields.push({
          field: `${change.field}[source_types][${sourceTypeName}][units][${unitIndex}][fuels][${fuelIndex}][${key}]`,
          old_value: null,
          new_value: value,
          change_type: "added",
        });
      }
    });

    // Handle fuel emissions
    if (fuelData.emissions && Array.isArray(fuelData.emissions)) {
      fuelData.emissions.forEach((emissionData: any, emissionIndex: number) => {
        if (!fuel.emissions[emissionIndex]) {
          fuel.emissions[emissionIndex] = {
            emissionIndex,
            fields: [],
          };
        }

        const emission = fuel.emissions[emissionIndex];
        Object.entries(emissionData).forEach(([key, value]) => {
          emission.fields.push({
            field: `${change.field}[source_types][${sourceTypeName}][units][${unitIndex}][fuels][${fuelIndex}][emissions][${emissionIndex}][${key}]`,
            old_value: null,
            new_value: value,
            change_type: "added",
          });
        });
      });
    }
  });
}

function handleUnitEmissionsData(
  unit: any,
  emissionsData: any[],
  change: ChangeItem,
  sourceTypeName: string,
  unitIndex: number,
) {
  emissionsData.forEach((emissionData: any, emissionIndex: number) => {
    if (!unit.emissions[emissionIndex]) {
      unit.emissions[emissionIndex] = {
        emissionIndex,
        fields: [],
      };
    }

    const emission = unit.emissions[emissionIndex];
    Object.entries(emissionData).forEach(([key, value]) => {
      emission.fields.push({
        field: `${change.field}[source_types][${sourceTypeName}][units][${unitIndex}][emissions][${emissionIndex}][${key}]`,
        old_value: null,
        new_value: value,
        change_type: "added",
      });
    });
  });
}
function handleUnitChanges(sourceType: any, parsed: any, change: ChangeItem) {
  if (!sourceType.units[parsed.unitIndex]) {
    sourceType.units[parsed.unitIndex] = {
      unitIndex: parsed.unitIndex,
      fields: [],
      fuels: {},
      emissions: {},
    };
  }

  const unit = sourceType.units[parsed.unitIndex];

  if (parsed.fuelIndex !== undefined) {
    if (!unit.fuels[parsed.fuelIndex]) {
      unit.fuels[parsed.fuelIndex] = {
        fuelIndex: parsed.fuelIndex,
        fields: [],
        emissions: {},
      };
    }

    if (parsed.emissionIndex !== undefined) {
      if (!unit.fuels[parsed.fuelIndex].emissions[parsed.emissionIndex]) {
        unit.fuels[parsed.fuelIndex].emissions[parsed.emissionIndex] = {
          emissionIndex: parsed.emissionIndex,
          fields: [],
        };
      }
      unit.fuels[parsed.fuelIndex].emissions[parsed.emissionIndex].fields.push(
        change,
      );
    } else {
      unit.fuels[parsed.fuelIndex].fields.push(change);
    }
  } else if (parsed.emissionIndex !== undefined) {
    if (!unit.emissions[parsed.emissionIndex]) {
      unit.emissions[parsed.emissionIndex] = {
        emissionIndex: parsed.emissionIndex,
        fields: [],
      };
    }
    unit.emissions[parsed.emissionIndex].fields.push(change);
  } else {
    unit.fields.push(change);
  }
}

function parseActivityData(
  facility: FacilityReportStructure,
  parsed: any,
  change: ChangeItem,
) {
  // Type guard to ensure we have the right structure
  if (typeof change.new_value !== "object" || !change.new_value?.source_types)
    return;

  Object.entries(change.new_value.source_types).forEach(
    ([sourceTypeName, sourceTypeData]: [string, any]) => {
      const activity = facility.activities[parsed.activityName];

      if (!activity.sourceTypes[sourceTypeName]) {
        activity.sourceTypes[sourceTypeName] = {
          sourceTypeName,
          fields: [],
          units: {},
        };
      }

      const sourceType = activity.sourceTypes[sourceTypeName];

      if (sourceTypeData.units && Array.isArray(sourceTypeData.units)) {
        sourceTypeData.units.forEach((unitData: any, unitIndex: number) => {
          if (!sourceType.units[unitIndex]) {
            sourceType.units[unitIndex] = {
              unitIndex,
              fields: [],
              fuels: {},
              emissions: {},
            };
          }

          const unit = sourceType.units[unitIndex];

          // Add unit-level fields
          Object.entries(unitData).forEach(([key, value]) => {
            if (key !== "fuels" && key !== "emissions") {
              unit.fields.push({
                deletedActivities: undefined,
                facilityName: undefined,
                field: `${change.field}[source_types][${sourceTypeName}][units][${unitIndex}][${key}]`,
                old_value: change.old_value as string | Record<string, any>,
                new_value: value as string | Record<string, any>,
                change_type: "added",
              });
            }
          });

          // Handle fuels
          if (unitData.fuels && Array.isArray(unitData.fuels)) {
            handleFuelsData(
              unit,
              unitData.fuels,
              change,
              sourceTypeName,
              unitIndex,
            );
          }

          // Handle unit-level emissions
          if (unitData.emissions && Array.isArray(unitData.emissions)) {
            handleUnitEmissionsData(
              unit,
              unitData.emissions,
              change,
              sourceTypeName,
              unitIndex,
            );
          }
        });
      }
    },
  );
}

function handleSourceTypeChanges(
  facility: FacilityReportStructure,
  parsed: any,
  change: ChangeItem,
) {
  if (!facility.activities[parsed.activityName]) {
    facility.activities[parsed.activityName] = {
      activityName: parsed.activityName,
      sourceTypes: {},
    };
  }

  if (
    !facility.activities[parsed.activityName].sourceTypes[parsed.sourceTypeName]
  ) {
    facility.activities[parsed.activityName].sourceTypes[
      parsed.sourceTypeName
    ] = {
      sourceTypeName: parsed.sourceTypeName,
      fields: [],
      units: {},
    };
  }

  const sourceType =
    facility.activities[parsed.activityName].sourceTypes[parsed.sourceTypeName];

  if (parsed.unitIndex !== undefined) {
    handleUnitChanges(sourceType, parsed, change);
  } else {
    sourceType.fields.push(change);
  }
}

function handleActivityChanges(
  facility: FacilityReportStructure,
  parsed: any,
  change: ChangeItem,
) {
  // Handle activity-level additions/removals
  if (parsed.fieldKey === "activity_data" && !parsed.sourceTypeName) {
    if (!facility.activities[parsed.activityName]) {
      facility.activities[parsed.activityName] = {
        activityName: parsed.activityName,
        sourceTypes: {},
      };
    }

    facility.activities[parsed.activityName].changeType = change.change_type;

    if (change.change_type === "added" && change.new_value) {
      facility.activities[parsed.activityName].new_value = change.new_value;
      parseActivityData(facility, parsed, change);
    } else if (change.change_type === "removed" && change.old_value) {
      facility.activities[parsed.activityName].new_value = change.old_value;
    }
    return;
  }

  // Handle source type level changes and field modifications
  if (parsed.sourceTypeName || parsed.activityName) {
    // Ensure activity exists
    if (!facility.activities[parsed.activityName]) {
      facility.activities[parsed.activityName] = {
        activityName: parsed.activityName,
        sourceTypes: {},
        changeType: "modified", // Mark as modified since we have field changes
      };
    }

    // If we don't have a change type set yet, mark as modified
    if (!facility.activities[parsed.activityName].changeType) {
      facility.activities[parsed.activityName].changeType = "modified";
    }

    if (parsed.sourceTypeName) {
      handleSourceTypeChanges(facility, parsed, change);
    }
  }
}
function handleOtherFacilitySections(
  facility: FacilityReportStructure,
  parsed: any,
  change: ChangeItem,
) {
  switch (parsed.section) {
    case "emission_summary":
      facility.emissionSummary.push(change);
      break;
    case "production_data":
      facility.productionData.push(change);
      break;
    case "emission_allocation":
      facility.emissionAllocation.push(change);
      break;
    case "non_attributable_emissions":
      facility.nonAttributableEmissions.push(change);
      break;
  }
}

export function organizeFacilityReportChanges(
  changes: ChangeItem[],
): Record<string, FacilityReportStructure> {
  const facilityReports: Record<string, FacilityReportStructure> = {};

  changes.forEach((change) => {
    const parsed = parseFacilityReportField(change.field);
    if (!parsed) return;

    if (!facilityReports[parsed.facilityName]) {
      facilityReports[parsed.facilityName] = {
        facilityName: parsed.facilityName,
        activities: {},
        emissionSummary: [],
        productionData: [],
        emissionAllocation: [],
        nonAttributableEmissions: [],
      };
    }

    const facility = facilityReports[parsed.facilityName];

    // Handle facility-level additions/removals
    if (parsed.isFacilityLevel) {
      if (change.change_type === "added") {
        facility.isFacilityAdded = true;
        facility.facilityData = change.new_value;
        return;
      } else if (change.change_type === "removed") {
        facility.isFacilityRemoved = true;
        facility.facilityData = change.old_value;
        return;
      }
    }

    // Handle activity data changes
    if (parsed.section === "activity_data" && parsed.activityName) {
      handleActivityChanges(facility, parsed, change);
    } else {
      // Handle other facility sections
      handleOtherFacilitySections(facility, parsed, change);
    }
  });

  return facilityReports;
}
