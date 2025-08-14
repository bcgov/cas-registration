import {
  SourceTypeChange,
  SourceTypeChangeDetection,
} from "../../finalReview/templates/types";

// Function to detect and handle source type changes
export const detectSourceTypeChanges = (
  sourceTypeName: string,
  sourceTypeData: any,
  sourceTypeChanges?: SourceTypeChange[],
): SourceTypeChangeDetection => {
  // First, check if sourceTypeData itself contains change information
  if (sourceTypeData && typeof sourceTypeData === "object") {
    if (
      sourceTypeData.sourceTypeName &&
      sourceTypeData.fields &&
      Array.isArray(sourceTypeData.fields)
    ) {
      const field = sourceTypeData.fields[0];
      if (field) {
        const changeType =
          field.change_type ||
          (!field.old_value && field.new_value
            ? "added"
            : field.old_value && !field.new_value
            ? "deleted"
            : "modified");

        return {
          changeType,
          changeData: {
            sourceTypeName: sourceTypeData.sourceTypeName,
            changeType,
            oldValue: field.old_value,
            newValue: field.new_value,
            fields: sourceTypeData.fields,
          },
        };
      }
    }
  }

  // Fallback to existing logic for backward compatibility
  if (!sourceTypeChanges) return { changeType: null };

  const change = sourceTypeChanges.find((sourceTypeChange) => {
    if (sourceTypeChange.sourceTypeName === sourceTypeName) {
      return true;
    }

    if (sourceTypeChange.fields && Array.isArray(sourceTypeChange.fields)) {
      return sourceTypeChange.fields.some((field: any) => {
        if (!field.field) return false;

        const fieldPath = field.field;
        const sourceTypeMatch = fieldPath.match(
          /\['source_types'\]\['([^']+)'\]/,
        );

        if (sourceTypeMatch && sourceTypeMatch[1]) {
          const extractedSourceTypeName = sourceTypeMatch[1];
          return extractedSourceTypeName === sourceTypeName;
        }

        return fieldPath.includes(sourceTypeName);
      });
    }

    return false;
  });

  if (!change) return { changeType: null };

  if (
    change.fields &&
    Array.isArray(change.fields) &&
    change.fields.length > 0
  ) {
    const fieldChange = change.fields[0];

    let changeType: "added" | "deleted" | "modified" = "modified";
    if (
      fieldChange.change_type &&
      (fieldChange.change_type === "added" ||
        fieldChange.change_type === "deleted" ||
        fieldChange.change_type === "modified")
    ) {
      changeType = fieldChange.change_type;
    } else if (!fieldChange.old_value && fieldChange.new_value) {
      changeType = "added";
    } else if (fieldChange.old_value && !fieldChange.new_value) {
      changeType = "deleted";
    }

    return {
      changeType,
      changeData: {
        ...change,
        changeType,
        oldValue: fieldChange.old_value,
        newValue: fieldChange.new_value,
      },
    };
  }

  return { changeType: change.changeType, changeData: change };
};

// Check if source type has nested changes
export const hasNestedChanges = (
  sourceTypeValue: any,
  sourceTypeChangeType: any,
): boolean => {
  return (
    sourceTypeValue &&
    typeof sourceTypeValue === "object" &&
    !Array.isArray(sourceTypeValue) &&
    ((sourceTypeValue as any).units ||
      (sourceTypeValue as any).fuels ||
      (sourceTypeValue as any).emissions) &&
    !sourceTypeChangeType
  );
};

// Group source type changes by activity
export const groupSourceTypeChangesByActivity = (
  sourceTypeChanges: SourceTypeChange[],
) => {
  return sourceTypeChanges.reduce(
    (acc, change) => {
      if (!acc[change.activityName]) {
        acc[change.activityName] = [];
      }
      acc[change.activityName].push(change);
      return acc;
    },
    {} as Record<string, SourceTypeChange[]>,
  );
};
