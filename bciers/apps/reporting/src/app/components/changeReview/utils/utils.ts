import { ChangeItem } from "../constants/types";
import { ChangeType } from "@reporting/src/app/components/finalReview/templates/types";

/**
 * Generate a human-readable label from a field key
 */
export function generateDynamicLabel(fieldKey: string): string {
  return fieldKey
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^./, (s) => s.toUpperCase())
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

/**
 * Get section name from field path
 */
export function getSection(field: string): string {
  if (field.includes("['report_operation']")) return "Report Operation";
  if (field.includes("['report_person_responsible']"))
    return "Person Responsible";
  if (field.includes("['report_compliance_summary']"))
    return "Compliance Summary";
  if (field.includes("['report_additional_data']"))
    return "Additional Reporting Data";
  if (field.includes("['facility_reports']")) return "Facility Reports";

  if (
    field.includes("['is_supplementary_report']") ||
    field.includes("['is_latest_submitted']") ||
    field.includes("['status']") ||
    field.includes("['reporting_year']") ||
    field.includes("['submission_date']") ||
    field.includes("['created_at']") ||
    field.includes("['updated_at']")
  ) {
    return "Report Information";
  }

  return "Other";
}
/**
 * Get field label from path
 */
export function getLabel(field: string): string {
  const parts = field.split("']['");
  const lastPart = parts[parts.length - 1]?.replace("']", "");

  if (field.includes("['fuelType']")) {
    const fuelTypeParts = field.split("']['fuelType']['");
    if (fuelTypeParts.length > 1) {
      const fuelTypeField = fuelTypeParts[1].replace("']", "");
      return generateDynamicLabel(fuelTypeField);
    }
  }

  if (field.includes("['methodology']")) {
    const methodologyParts = field.split("']['methodology']['");
    if (methodologyParts.length > 1) {
      const methodologyField = methodologyParts[1].replace("']", "");
      return generateDynamicLabel(methodologyField);
    }
  }

  if (field.includes("['report_person_responsible']")) {
    if (field.includes("['first_name']") || field.includes("['last_name']")) {
      return "Name";
    }
  }

  return generateDynamicLabel(lastPart || field);
}

/**
 * Get simplified field label based on context
 */
export function getContextualLabel(field: string, context?: string): string {
  if (context === "facility_report") {
    const parts = field.split("']['");
    const lastPart = parts[parts.length - 1]?.replace("']", "");
    return generateDynamicLabel(lastPart || field);
  }

  return getLabel(field);
}

/**
 * Group person responsible name changes
 */
export function groupPersonResponsibleChanges(
  items: ChangeItem[],
): ChangeItem[] {
  const grouped: ChangeItem[] = [];
  const nameChanges = items.filter(
    (item) =>
      item.field.includes("['first_name']") ||
      item.field.includes("['last_name']"),
  );

  if (nameChanges.length > 0) {
    const firstNameChange = nameChanges.find((item) =>
      item.field.includes("['first_name']"),
    );
    const lastNameChange = nameChanges.find((item) =>
      item.field.includes("['last_name']"),
    );

    const combinedNameChange: ChangeItem = {
      change_type: "",
      field: "root['report_person_responsible']['name']",
      oldValue: `${firstNameChange?.oldValue || ""} ${
        lastNameChange?.oldValue || ""
      }`.trim(),
      newValue: `${firstNameChange?.newValue || ""} ${
        lastNameChange?.newValue || ""
      }`.trim(),
    };

    grouped.push(combinedNameChange);
  }

  return grouped;
}

/**
 * Filter excluded fields
 */
export function filterExcludedFields(changes: ChangeItem[]): ChangeItem[] {
  const excludedFields = [
    "is_supplementary_report",
    "is_latest_submitted",
    "status",
    "reporting_year",
    "submission_date",
    "created_at",
    "updated_at",
  ];

  return changes.filter((change) => {
    const isExcludedField = excludedFields.some((field) =>
      change.field.includes(`['${field}']`),
    );
    return !isExcludedField;
  });
}

/**
 * Checks if a value is a plain object (not array, not null)
 */
export function isDictObject(value: any): boolean {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export const normalizeChangeType = (type?: string): ChangeType =>
  type === "removed" ? "deleted" : (type as ChangeType) || "modified"; // Determine the change type for the activity

export const isNonEmptyValue = (v: unknown): boolean =>
  v != null &&
  (typeof v !== "string" ? true : v.trim() !== "") &&
  (Array.isArray(v) ? v.length > 0 : true) &&
  (typeof v === "object" && !Array.isArray(v)
    ? Object.keys(v).length > 0
    : true);
// Check if the object itself is entirely added at this level
export const isWholeObjectAdded = (oldObj: any, newObj: any): boolean => {
  if (!oldObj && newObj) {
    const fields = newObj.fields || [];
    // Only consider fields at this level; ignore nested children
    return fields.length > 0
      ? fields.every((f: any) => f.oldValue == null)
      : false;
  }
  return false;
};

// Check if the object itself is entirely deleted at this level
export const isWholeObjectDeleted = (oldObj: any, newObj: any): boolean => {
  if (oldObj && !newObj) {
    const fields = oldObj.fields || [];
    // Only consider fields at this level; ignore nested children
    return fields.length > 0
      ? fields.every((f: any) => f.newValue == null)
      : false;
  }
  return false;
};
// Utility to normalize old_value/new_value to oldValue/newValue recursively
export function normalizeChangeKeys(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(normalizeChangeKeys);
  }
  if (obj && typeof obj === "object") {
    const newObj: any = {};
    for (const key in obj) {
      let newKey = key;
      if (key === "old_value") newKey = "oldValue";
      if (key === "new_value") newKey = "newValue";
      newObj[newKey] = normalizeChangeKeys(obj[key]);
    }
    return newObj;
  }
  return obj;
}
