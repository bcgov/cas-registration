import { FieldChange } from "../../finalReview/templates/types";

// Helper function to generate display labels
export const generateDisplayLabel = (field: string): string => {
  if (!field) return "";

  // Extract all bracketed keys ['key']
  const bracketMatches = field.match(/\['([^']+)']/g);
  if (bracketMatches && bracketMatches.length > 0) {
    field = bracketMatches[bracketMatches.length - 1].replace(/\['|']/g, "");
  } else if (field.includes(".")) {
    // Otherwise take last segment from dot notation
    const parts = field.split(".");
    field = parts[parts.length - 1];
  }

  // Convert camelCase or PascalCase to spaced words
  return field
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
};

// Helper function to categorize fields
export const categorizeField = (
  field: string,
): "unit" | "fuel" | "emission" => {
  const fieldLower = field.toLowerCase();
  if (fieldLower.includes("fuel")) return "fuel";
  if (
    fieldLower.includes("emission") ||
    fieldLower.includes("gas") ||
    fieldLower.includes("methodology")
  )
    return "emission";
  return "unit";
};

// Helper function to compare and render changes
export const compareAndRenderChanges = (
  oldObj: any,
  newObj: any,
  path: string = "",
): FieldChange[] => {
  const changes: FieldChange[] = [];

  const processValue = (key: string, currentPath: string = "") => {
    const fullPath = currentPath ? `${currentPath}.${key}` : key;

    if (
      typeof oldObj[key] === "object" &&
      oldObj[key] !== null &&
      typeof newObj[key] === "object" &&
      newObj[key] !== null &&
      !Array.isArray(oldObj[key])
    ) {
      changes.push(
        ...compareAndRenderChanges(oldObj[key], newObj[key], fullPath),
      );
    } else if (Array.isArray(oldObj[key]) && Array.isArray(newObj[key])) {
      oldObj[key].forEach((oldItem: any, index: number) => {
        const newItem = newObj[key][index];
        if (newItem) {
          const arrayPath = `${fullPath}.${index}`;
          const arrayChanges = compareAndRenderChanges(
            oldItem,
            newItem,
            arrayPath,
          );

          arrayChanges.forEach((change) => {
            if (key === "fuels") {
              change.fuelIndex = index;
            } else if (key === "emissions") {
              change.emissionIndex = index;
            }
          });

          changes.push(...arrayChanges);
        }
      });
    } else if (oldObj[key] !== newObj[key]) {
      changes.push({
        field: key,
        displayLabel: generateDisplayLabel(key),
        old_value: oldObj[key],
        new_value: newObj[key],
        category: categorizeField(fullPath),
      });
    }
  };

  if (!oldObj || !newObj) return changes;

  const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);
  allKeys.forEach((key) => {
    if (oldObj[key] !== undefined && newObj[key] !== undefined) {
      processValue(key, path);
    }
  });

  return changes;
};
