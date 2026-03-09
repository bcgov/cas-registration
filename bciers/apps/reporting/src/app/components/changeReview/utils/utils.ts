import { ChangeItem } from "../constants/types";

/**
 * Normalize a facility name extracted from a field path string like ['Facility 42']
 * by removing leading/trailing quotes and trimming whitespace.
 * This is the SINGLE source of truth — all parsers/organizers must use this.
 */
export const normalizeFacilityName = (raw: string): string =>
  (raw || "").replace(/^['"]|['"]$/g, "").trim();

/**
 * Normalize a name by removing leading/trailing quotes and trimming whitespace
 */
export const normalize = (name: string) =>
  (name || "").replace(/(^['"]|['"]$)/g, "").trim();

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
      change_type:
        firstNameChange?.change_type ??
        lastNameChange?.change_type ??
        "modified",
      field: "root['report_person_responsible']['name']",
      oldValue:
        `${firstNameChange?.oldValue || ""} ${lastNameChange?.oldValue || ""}`.trim(),
      newValue:
        `${firstNameChange?.newValue || ""} ${lastNameChange?.newValue || ""}`.trim(),
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
    return fields.length > 0
      ? fields.every((f: any) => f.newValue == null)
      : false;
  }
  return false;
};

/**
 * Normalize old_value/new_value (snake_case from API) → oldValue/newValue (camelCase)
 * on the TOP-LEVEL change objects ONLY.
 *
 * ⚠️  The previous implementation recursed into every nested object which would
 *     corrupt the actual payload data (e.g. activity_data objects whose keys
 *     happened to be named old_value/new_value).  We now only touch the
 *     top-level change-item keys.
 */
export function normalizeChangeKeys(changes: ChangeItem[]): ChangeItem[] {
  return changes.map((change) => {
    const c = { ...change } as any;

    // Only add camelCase alias if it doesn't already exist
    if ("old_value" in c && !("oldValue" in c)) {
      c.oldValue = c.old_value;
    }
    if ("new_value" in c && !("newValue" in c)) {
      c.newValue = c.new_value;
    }

    return c as ChangeItem;
  });
}
