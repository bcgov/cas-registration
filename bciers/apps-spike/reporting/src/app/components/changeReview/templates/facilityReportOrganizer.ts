import { ChangeItem, FacilityReportStructure } from "../constants/types";
import { parseFacilityReportField } from "./facilityReportParser";

// Utility to ensure nested array exists
function ensureArray(obj: any, key: string) {
  if (!obj[key]) obj[key] = [];
  return obj[key];
}

// Generic recursive handler for nested data
function handleNestedChanges({
  parent,
  newData,
  oldData,
  path,
  arrayKey,
  childArrayKey,
  fieldExcludes = [],
}: {
  parent: any;
  newData: any[];
  oldData: any[];
  path: string;
  arrayKey: string;
  childArrayKey?: string;
  fieldExcludes?: string[];
}) {
  const arr = ensureArray(parent, arrayKey);
  (newData || []).forEach((item: any, idx: number) => {
    if (!arr[idx]) arr[idx] = { fields: [], [childArrayKey || "children"]: [] };
    const container = arr[idx];
    const oldItem = oldData && oldData[idx] ? oldData[idx] : {};
    // Detect field changes
    Object.entries(item).forEach(([key, value]) => {
      if (key === childArrayKey || fieldExcludes.includes(key)) return;
      const oldValue = oldItem[key];
      let changeType;
      if (oldValue === undefined) changeType = "added";
      else if (value === undefined) changeType = "deleted";
      else if (value !== oldValue) changeType = "modified";
      else return;
      container.fields.push({
        field: `${path}[${arrayKey}][${idx}][${key}]`,
        oldValue: oldValue ?? null,
        newValue: value,
        change_type: changeType,
      });
    });
    // Detect deleted fields
    Object.entries(oldItem).forEach(([key, oldValue]) => {
      if (key === childArrayKey || fieldExcludes.includes(key)) return;
      if (item[key] === undefined) {
        container.fields.push({
          field: `${path}[${arrayKey}][${idx}][${key}]`,
          oldValue,
          newValue: null,
          change_type: "deleted",
        });
      }
    });
    // Recursively handle child arrays
    if (
      childArrayKey &&
      item[childArrayKey] &&
      Array.isArray(item[childArrayKey])
    ) {
      handleNestedChanges({
        parent: container,
        newData: item[childArrayKey],
        oldData: oldItem[childArrayKey] || [],
        path: `${path}[${arrayKey}][${idx}]`,
        arrayKey: childArrayKey,
        fieldExcludes,
      });
    }
    // Handle deleted child arrays
    if (childArrayKey && oldItem[childArrayKey]) {
      (oldItem[childArrayKey] || []).forEach(
        (oldChild: any, childIdx: number) => {
          if (!item[childArrayKey] || !item[childArrayKey][childIdx]) {
            const childArr = ensureArray(container, childArrayKey);
            if (!childArr[childIdx]) childArr[childIdx] = { fields: [] };
            Object.entries(oldChild).forEach(([k, v]) => {
              childArr[childIdx].fields.push({
                field: `${path}[${arrayKey}][${idx}][${childArrayKey}][${childIdx}][${k}]`,
                oldValue: v,
                newValue: null,
                change_type: "deleted",
              });
            });
          }
        },
      );
    }
  });
}

// --- Functions for handling units, fuels, and emissions ---
function handleUnitNestedData(
  unit: any,
  unitData: any,
  oldUnitData: any,
  path: string,
) {
  if (unitData.fuels && Array.isArray(unitData.fuels)) {
    handleNestedChanges({
      parent: unit,
      newData: unitData.fuels,
      oldData: oldUnitData?.fuels || [],
      path,
      arrayKey: "fuels",
      childArrayKey: "emissions",
      fieldExcludes: [],
    });
  }
  if (unitData.emissions && Array.isArray(unitData.emissions)) {
    handleNestedChanges({
      parent: unit,
      newData: unitData.emissions,
      oldData: oldUnitData?.emissions || [],
      path,
      arrayKey: "emissions",
      childArrayKey: undefined,
      fieldExcludes: [],
    });
  }
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
    if (!unit.fuels[parsed.fuelIndex])
      unit.fuels[parsed.fuelIndex] = {
        fuelIndex: parsed.fuelIndex,
        fields: [],
        emissions: {},
      };

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
    if (!unit.emissions[parsed.emissionIndex])
      unit.emissions[parsed.emissionIndex] = {
        emissionIndex: parsed.emissionIndex,
        fields: [],
      };
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
  if (
    typeof change.newValue !== "object" ||
    Array.isArray(change.newValue) ||
    !change.newValue?.source_types
  )
    return;

  Object.entries(change.newValue.source_types).forEach(
    ([sourceTypeName, sourceTypeData]: [string, any]) => {
      const activity = facility.activities[parsed.activityName];
      if (!activity.sourceTypes[sourceTypeName])
        activity.sourceTypes[sourceTypeName] = {
          sourceTypeName,
          fields: [],
          units: {},
        };
      const sourceType = activity.sourceTypes[sourceTypeName];

      if (sourceTypeData.units && Array.isArray(sourceTypeData.units)) {
        sourceTypeData.units.forEach((unitData: any, unitIndex: number) => {
          if (!sourceType.units[unitIndex])
            sourceType.units[unitIndex] = {
              unitIndex,
              fields: [],
              fuels: {},
              emissions: {},
            };
          const unit = sourceType.units[unitIndex];

          Object.entries(unitData).forEach(([key, value]) => {
            if (key !== "fuels" && key !== "emissions") {
              unit.fields.push({
                deletedActivities: undefined,
                facilityName: undefined,
                field: `${change.field}[source_types][${sourceTypeName}][units][${unitIndex}][${key}]`,
                oldValue: change.oldValue as string | Record<string, any>,
                newValue: value as string | Record<string, any>,
                change_type: "added",
              });
            }
          });

          if (unitData.fuels && Array.isArray(unitData.fuels))
            handleUnitNestedData(
              unit,
              unitData,
              {},
              `${change.field}[source_types][${sourceTypeName}][units][${unitIndex}]`,
            );
          if (unitData.emissions && Array.isArray(unitData.emissions))
            handleUnitNestedData(
              unit,
              unitData,
              {},
              `${change.field}[source_types][${sourceTypeName}][units][${unitIndex}]`,
            );
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
  if (!facility.activities[parsed.activityName])
    facility.activities[parsed.activityName] = {
      activityName: parsed.activityName,
      sourceTypes: {},
    };
  if (
    !facility.activities[parsed.activityName].sourceTypes[parsed.sourceTypeName]
  )
    facility.activities[parsed.activityName].sourceTypes[
      parsed.sourceTypeName
    ] = { sourceTypeName: parsed.sourceTypeName, fields: [], units: {} };
  const sourceType =
    facility.activities[parsed.activityName].sourceTypes[parsed.sourceTypeName];
  if (parsed.unitIndex !== undefined)
    handleUnitChanges(sourceType, parsed, change);
  else sourceType.fields.push(change);
}

function handleActivityChanges(
  facility: FacilityReportStructure,
  parsed: any,
  change: ChangeItem,
) {
  if (parsed.fieldKey === "activity_data" && !parsed.sourceTypeName) {
    if (!facility.activities[parsed.activityName])
      facility.activities[parsed.activityName] = {
        activityName: parsed.activityName,
        sourceTypes: {},
      };
    facility.activities[parsed.activityName].changeType = change.change_type;

    if (change.change_type === "added" && change.newValue)
      parseActivityData(facility, parsed, change);
    else if (change.change_type === "removed" && change.oldValue)
      facility.activities[parsed.activityName].newValue = change.oldValue;
    return;
  }

  if (parsed.sourceTypeName || parsed.activityName) {
    if (!facility.activities[parsed.activityName])
      facility.activities[parsed.activityName] = {
        activityName: parsed.activityName,
        sourceTypes: {},
        changeType: "modified",
      };
    if (!facility.activities[parsed.activityName].changeType)
      facility.activities[parsed.activityName].changeType = "modified";
    if (parsed.sourceTypeName)
      handleSourceTypeChanges(facility, parsed, change);
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

// --- Updated function to include facility_name change ---
export function organizeFacilityReportChanges(
  changes: ChangeItem[],
): Record<string, FacilityReportStructure> {
  const facilityReports: Record<string, FacilityReportStructure> = {};
  changes.forEach((change) => {
    const parsed = parseFacilityReportField(change.field);
    if (!parsed) return;

    // Normalize old_value/new_value to oldValue/newValue
    const normalizedChange = {
      ...change,
      oldValue: change.oldValue,
      newValue: change.newValue,
      change_type: change.change_type,
    };

    // Use new facility name if facility_name changed
    const facilityKey = String(
      parsed.fieldKey === "facility_name" && normalizedChange.newValue
        ? normalizedChange.newValue
        : parsed.facilityName,
    );

    if (!facilityReports[facilityKey]) {
      facilityReports[facilityKey] = {
        facilityName: facilityKey,
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
      };
    }
    const facility = facilityReports[facilityKey];

    // Handle facility-level changes
    if (parsed.isFacilityLevel) {
      if (normalizedChange.change_type === "added") {
        facility.isFacilityAdded = true;
        facility.facilityData = normalizedChange.newValue;
        return;
      }
      if (normalizedChange.change_type === "removed") {
        facility.isFacilityRemoved = true;
        facility.facilityData = normalizedChange.oldValue;
        return;
      }
      if (parsed.fieldKey === "facility_name") {
        facility.facilityNameChange = {
          ...normalizedChange,
          displayLabel: "Facility Name Change",
          field: normalizedChange.field,
          isNewAddition: false,
          isDeleted: false,
          facilityName: parsed.facilityName,
        };
        if (typeof normalizedChange.newValue === "string") {
          facility.facilityName = normalizedChange.newValue;
        }
        return;
      }
    }

    // Handle activity or other sections
    if (parsed.section === "activity_data" && parsed.activityName)
      handleActivityChanges(facility, parsed, normalizedChange);
    else handleOtherFacilitySections(facility, parsed, normalizedChange);
  });

  return facilityReports;
}
