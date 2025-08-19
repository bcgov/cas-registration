import { ChangeItem } from "../constants/types";

export function parseFacilityReportField(field: string): {
  facilityName: string;
  section: string;
  activityName?: string;
  sourceTypeName?: string;
  unitIndex?: number;
  fuelIndex?: number;
  emissionIndex?: number;
  fieldKey: string;
  isFacilityLevel?: boolean;
} | null {
  // Updated regex to handle facility names with spaces and special characters
  const facilityMatch = field.match(/\['facility_reports'\]\[(.*?)\]/);
  if (!facilityMatch) return null;

  // Remove any surrounding quotes from facility name
  const facilityName = facilityMatch[1].replace(/(^['"])|(['"]$)/g, "");

  const remainingPath = field.substring(
    facilityMatch.index! + facilityMatch[0].length,
  );

  const pathSegments = remainingPath.match(/\[[^\[\]]*\]/g) || [];
  const cleanSegments = pathSegments.map((segment) =>
    segment.slice(1, -1).replace(/^['"]|['"]$/g, ""),
  );

  if (cleanSegments.length === 0) {
    return {
      facilityName,
      section: "facility",
      fieldKey: "facility_report",
      isFacilityLevel: true,
    };
  }

  const mainSection = cleanSegments[0];

  if (mainSection === "activity_data") {
    const activityName = cleanSegments[1];

    if (cleanSegments.length === 2) {
      return {
        facilityName,
        section: "activity_data",
        activityName,
        fieldKey: "activity_data",
      };
    }

    if (cleanSegments[2] === "source_types") {
      const sourceTypeName = cleanSegments[3];
      let unitIndex: number | undefined;
      let fuelIndex: number | undefined;
      let emissionIndex: number | undefined;
      let fieldKey = "";

      for (let i = 4; i < cleanSegments.length; i++) {
        const segment = cleanSegments[i];
        const nextSegment = cleanSegments[i + 1];

        if (segment === "units" && nextSegment && /^\d+$/.test(nextSegment)) {
          unitIndex = parseInt(nextSegment);
          i++;
        } else if (
          segment === "fuels" &&
          nextSegment &&
          /^\d+$/.test(nextSegment)
        ) {
          fuelIndex = parseInt(nextSegment);
          i++;
        } else if (
          segment === "emissions" &&
          nextSegment &&
          /^\d+$/.test(nextSegment)
        ) {
          emissionIndex = parseInt(nextSegment);
          i++;
        } else if (i === cleanSegments.length - 1) {
          fieldKey = segment;
        } else if (i === cleanSegments.length - 2 && cleanSegments[i + 1]) {
          fieldKey = cleanSegments[i + 1];
          break;
        }
      }

      if (
        unitIndex === undefined &&
        fuelIndex === undefined &&
        emissionIndex === undefined &&
        cleanSegments.length > 4
      ) {
        fieldKey = cleanSegments[cleanSegments.length - 1];
      }

      return {
        facilityName,
        section: "activity_data",
        activityName,
        sourceTypeName,
        unitIndex,
        fuelIndex,
        emissionIndex,
        fieldKey: fieldKey || "",
      };
    }
  }

  const sectionMappings: Record<string, string> = {
    reportnonattributableemissions_records: "non_attributable_emissions",
    emission_summary: "emission_summary",
    report_products: "production_data",
    report_emission_allocation: "emission_allocation",
    facility_name: "facility_info",
  };

  for (const [pathSegment, sectionName] of Object.entries(sectionMappings)) {
    if (remainingPath.includes(`['${pathSegment}']`)) {
      const fieldKey = cleanSegments[cleanSegments.length - 1] || pathSegment;
      return {
        facilityName,
        section: sectionName,
        fieldKey,
      };
    }
  }

  const fieldKey = cleanSegments[cleanSegments.length - 1] || "other";
  return {
    facilityName,
    section: "other",
    fieldKey,
  };
}

export function detectActivityChangesInModifiedFacility(change: ChangeItem): {
  facilityName: string;
  addedActivities?: ActivityItem[];
  removedActivities?: ActivityItem[];
} | null {
  // Must be a facility_reports field
  if (!change.field.includes("['facility_reports']")) {
    return null;
  }

  const facilityMatch = change.field.match(/\['facility_reports']\[([^\]]+)]/);
  if (!facilityMatch) return null;

  const facilityName = facilityMatch[1];
  const oldValue = change.old_value;
  const newValue = change.new_value;

  const isValidFacilityObject = (value: any): value is Record<string, any> => {
    return (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      "activity_data" in value
    );
  };

  let oldActivities: Record<string, any> = {};
  let newActivities: Record<string, any> = {};

  if (change.change_type === "removed") {
    if (isValidFacilityObject(oldValue)) {
      oldActivities = oldValue.activity_data || {};
    } else if (
      oldValue &&
      typeof oldValue === "object" &&
      "activity" in oldValue
    ) {
      oldActivities = { [(oldValue as any).activity]: oldValue };
    }
  } else if (change.change_type === "added") {
    if (isValidFacilityObject(newValue)) {
      newActivities = newValue.activity_data || {};
    } else if (
      newValue &&
      typeof newValue === "object" &&
      "activity" in newValue
    ) {
      newActivities = { [(newValue as any).activity]: newValue };
    }
  } else if (change.change_type === "modified") {
    // Both sides contain activities
    if (isValidFacilityObject(oldValue)) {
      oldActivities = oldValue.activity_data || {};
    }
    if (isValidFacilityObject(newValue)) {
      newActivities = newValue.activity_data || {};
    }
  }

  // Detect added & removed activities
  const addedActivityNames = Object.keys(newActivities).filter(
    (name) => !oldActivities[name],
  );
  const removedActivityNames = Object.keys(oldActivities).filter(
    (name) => !newActivities[name],
  );

  const addedActivities: ActivityItem[] = addedActivityNames.map((name) => ({
    activity: name,
    source_types: newActivities[name]?.source_types || {},
  }));
  const removedActivities: ActivityItem[] = removedActivityNames.map(
    (name) => ({
      activity: name,
      source_types: oldActivities[name]?.source_types || {},
    }),
  );

  if (!addedActivities.length && !removedActivities.length) return null;

  return {
    facilityName: facilityName.replace(/'/g, ""),
    addedActivities,
    removedActivities,
  };
}

export interface SourceTypeChange {
  facilityName: string;
  activityName: string;
  sourceTypeName: string;
  changeType: "added" | "deleted" | "modified";
  oldValue?: any;
  newValue?: any;
}

export function detectSourceTypeChanges(
  change: ChangeItem,
): SourceTypeChange[] {
  if (!change.field.includes("facility_reports")) return [];

  // Extract facility name from the field path
  const facilityMatch = change.field.match(/\['facility_reports'\]\[(.*?)\]/);
  if (!facilityMatch) return [];
  const facilityName = facilityMatch[1];

  // Extract activity name from the field path
  const activityMatch = change.field.match(/\['activity_data'\]\[(.*?)\]/);
  if (!activityMatch) return [];
  const activityName = activityMatch[1];

  // Check if this is a source type change
  const oldValue = change.old_value;
  const newValue = change.new_value;

  // Type guard to check if values are objects with source_types
  const isValidSourceTypeObject = (
    value: any,
  ): value is { source_types: Record<string, any> } => {
    return (
      value &&
      typeof value === "object" &&
      true &&
      !Array.isArray(value) &&
      "source_types" in value
    );
  };

  // Only process if both old and new values are valid source type objects
  if (
    !isValidSourceTypeObject(oldValue) ||
    !isValidSourceTypeObject(newValue)
  ) {
    return [];
  }

  const oldSourceTypes = oldValue.source_types || {};
  const newSourceTypes = newValue.source_types || {};

  // Compare source types
  const allSourceTypes = new Set([
    ...Object.keys(oldSourceTypes),
    ...Object.keys(newSourceTypes),
  ]);

  const changes: SourceTypeChange[] = [];

  for (const sourceType of allSourceTypes) {
    if (!(sourceType in oldSourceTypes)) {
      changes.push({
        facilityName,
        activityName,
        sourceTypeName: sourceType,
        changeType: "added",
        newValue: newSourceTypes[sourceType],
      });
    } else if (!(sourceType in newSourceTypes)) {
      changes.push({
        facilityName,
        activityName,
        sourceTypeName: sourceType,
        changeType: "deleted",
        oldValue: oldSourceTypes[sourceType],
      });
    } else if (
      JSON.stringify(oldSourceTypes[sourceType]) !==
      JSON.stringify(newSourceTypes[sourceType])
    ) {
      changes.push({
        facilityName,
        activityName,
        sourceTypeName: sourceType,
        changeType: "modified",
        oldValue: oldSourceTypes[sourceType],
        newValue: newSourceTypes[sourceType],
      });
    }
  }

  return changes;
}

interface ActivityItem {
  activity: string;
  source_types?: Record<string, any>;
  [key: string]: any;
}
