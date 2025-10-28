import { ActivityItem, ChangeItem, SourceTypeChange } from "../constants/types";

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
  // regex to handle facility names with spaces and special characters
  const facilityMatch = field.match(/\['facility_reports'\]\[(.*?)\]/);
  if (!facilityMatch) return null;

  // Remove any surrounding quotes from facility name
  const facilityName = facilityMatch[1].replace(/(^['"])|(['"]$)/g, "");

  const remainingPath = field.substring(
    facilityMatch.index! + facilityMatch[0].length,
  );

  const pathSegments = remainingPath.match(/\[[^\[\]]*\]/g) || [];
  // This regex extracts the value inside square brackets, optionally surrounded by single or double quotes.
  // For example, it matches ["section"], ['activity'], or [index] and returns section, activity, or index respectively.
  const cleanSegments = pathSegments.map((segment) => {
    const match = segment.match(/^\[(?:'|")?(.*?)(?:'|")?\]$/);
    return match ? match[1] : "";
  });

  if (cleanSegments.length === 0) {
    return {
      facilityName,
      section: "facility",
      fieldKey: "facility_report",
      isFacilityLevel: true,
    };
  }

  // Added this block to handle facility_name as facility-level
  if (cleanSegments.length === 1 && cleanSegments[0] === "facility_name") {
    return {
      facilityName,
      section: "facility_info",
      fieldKey: "facility_name",
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

      // Iterate through the remaining segments to extract indices and field key.
      // This loop looks for specific segment names (units, fuels, emissions) followed by an index, and sets the corresponding variable.
      // If none of those match, it tries to determine the fieldKey from the last or second-to-last segment.
      for (let i = 4; i < cleanSegments.length; i++) {
        const segment = cleanSegments[i];
        const nextSegment = cleanSegments[i + 1];

        // If segment is 'units' and next is a number, set unitIndex
        if (segment === "units" && nextSegment && /^\d+$/.test(nextSegment)) {
          unitIndex = parseInt(nextSegment);
          i++;
          // If segment is 'fuels' and next is a number, set fuelIndex
        } else if (
          segment === "fuels" &&
          nextSegment &&
          /^\d+$/.test(nextSegment)
        ) {
          fuelIndex = parseInt(nextSegment);
          i++;
          // If segment is 'emissions' and next is a number, set emissionIndex
        } else if (
          segment === "emissions" &&
          nextSegment &&
          /^\d+$/.test(nextSegment)
        ) {
          emissionIndex = parseInt(nextSegment);
          i++;
          // If this is the last segment, set fieldKey
        } else if (i === cleanSegments.length - 1) {
          fieldKey = segment;
          // If this is the second-to-last segment, set fieldKey to the last segment and break
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
  const oldValue = change.oldValue;
  const newValue = change.newValue;

  const isValidFacilityObject = (
    value: any,
  ): value is Record<string, any> & { activity_data: any } => {
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
      !Array.isArray(oldValue) &&
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
      !Array.isArray(newValue) &&
      "activity" in newValue
    ) {
      newActivities = { [(newValue as any).activity]: newValue };
    }
  } else if (change.change_type === "modified") {
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

export function detectSourceTypeChanges(
  change: ChangeItem,
): SourceTypeChange[] {
  if (!change.field.includes("facility_reports")) return [];

  // Extract facility name from the field path
  const facilityMatch = change.field.match(/\['facility_reports'\]\[(.*?)\]/);
  if (!facilityMatch) return [];
  const facilityNameRaw = facilityMatch[1];
  const facilityName = facilityNameRaw.replace(/(^['"]|['"]$)/g, "");

  // Extract activity name from the field path
  const activityMatch = change.field.match(/\['activity_data'\]\[(.*?)\]/);
  if (!activityMatch) return [];
  const activityNameRaw = activityMatch[1];
  const activityName = activityNameRaw.replace(/(^['"]|['"]$)/g, "");

  // old/new may be either:
  //  - { source_types: { ... } }  OR
  //  - { "<source type name>": { ... }, ... } (the mapping itself)
  const oldValue = change.oldValue;
  const newValue = change.newValue;

  const extractSourceTypes = (value: any): Record<string, any> | null => {
    if (!value || typeof value !== "object" || Array.isArray(value))
      return null;
    if (
      "source_types" in value &&
      typeof value.source_types === "object" &&
      !Array.isArray(value.source_types)
    ) {
      return value.source_types;
    }
    // assume the value itself is the mapping of source type names -> details
    return value;
  };

  const oldSourceTypes = extractSourceTypes(oldValue) || {};
  const newSourceTypes = extractSourceTypes(newValue) || {};

  // If both are empty objects (not parseable), bail out
  if (
    Object.keys(oldSourceTypes).length === 0 &&
    Object.keys(newSourceTypes).length === 0
  ) {
    return [];
  }

  // Filter out structural keys that are not source type names
  const structuralKeys = [
    "units",
    "fuels",
    "emissions",
    "gscUnitName",
    "gscUnitType",
    "gscUnitDescription",
    "description",
  ];
  const isSourceTypeName = (key: string) => !structuralKeys.includes(key);

  // Compare keys, filtering out structural keys
  const allSourceTypes = new Set([
    ...Object.keys(oldSourceTypes).filter(isSourceTypeName),
    ...Object.keys(newSourceTypes).filter(isSourceTypeName),
  ]);

  const changes: SourceTypeChange[] = [];

  for (const sourceType of allSourceTypes) {
    const inOld = sourceType in oldSourceTypes;
    const inNew = sourceType in newSourceTypes;

    if (!inOld && inNew) {
      changes.push({
        fields: change.field,
        facilityName,
        activityName,
        sourceTypeName: sourceType,
        changeType: "added",
        newValue: newSourceTypes[sourceType],
        oldValue: null,
      });
    } else if (inOld && !inNew) {
      changes.push({
        fields: change.field,
        facilityName,
        activityName,
        sourceTypeName: sourceType,
        changeType: "deleted",
        oldValue: oldSourceTypes[sourceType],
      });
    } else {
      // present in both: compare serialized content to detect modification
      const oldJson = JSON.stringify(oldSourceTypes[sourceType]);
      const newJson = JSON.stringify(newSourceTypes[sourceType]);
      if (oldJson !== newJson) {
        changes.push({
          fields: change.field,
          facilityName,
          activityName,
          sourceTypeName: sourceType,
          changeType: "modified",
          oldValue: oldSourceTypes[sourceType],
          newValue: newSourceTypes[sourceType],
        });
      }
    }
  }

  return changes;
}
