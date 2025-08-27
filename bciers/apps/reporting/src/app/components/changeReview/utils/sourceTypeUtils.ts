import { SourceTypeChange } from "../constants/types";

export type DetectedSourceTypeChange = {
  changeType: "added" | "deleted" | "modified" | null;
  changeData?: {
    newValue: any;
    sourceTypeName: string;
    changeType: "added" | "deleted" | "modified";
    oldValue: any;
    fields: any[];
  };
};

export const detectSourceTypeChanges = (
  sourceTypeName: string,
  sourceTypeData: any,
  sourceTypeChanges?: SourceTypeChange[],
): DetectedSourceTypeChange => {
  // Case 1: sourceTypeData provided
  if (
    sourceTypeData &&
    typeof sourceTypeData === "object" &&
    sourceTypeData.sourceTypeName &&
    Array.isArray(sourceTypeData.fields) &&
    sourceTypeData.fields.length > 0
  ) {
    const field = sourceTypeData.fields[0];
    const changeType: "added" | "deleted" | "modified" =
      field.change_type ||
      (!field.oldValue && field.newValue
        ? "added"
        : field.oldValue && !field.newValue
        ? "deleted"
        : "modified");

    return {
      changeType,
      changeData: {
        sourceTypeName: sourceTypeData.sourceTypeName,
        changeType,
        oldValue: field.oldValue,
        newValue: field.newValue,
        fields: sourceTypeData.fields,
      },
    };
  }

  // Case 2: sourceTypeChanges array
  if (!sourceTypeChanges) return { changeType: null };

  const change = sourceTypeChanges.find((stc) => {
    if (stc.sourceTypeName === sourceTypeName) return true;
    if (Array.isArray(stc.fields)) {
      return stc.fields.some((f: any) => {
        if (!f.field) return false;
        const match = f.field.match(/\['source_types'\]\['([^']+)'\]/);
        return (
          match?.[1] === sourceTypeName || f.field.includes(sourceTypeName)
        );
      });
    }
    return false;
  });

  if (!change) return { changeType: null };

  if (Array.isArray(change.fields) && change.fields.length > 0) {
    const fieldChange = change.fields[0];
    let changeType: "added" | "deleted" | "modified" = "modified";

    if (
      fieldChange.change_type &&
      ["added", "deleted", "modified"].includes(fieldChange.change_type)
    ) {
      changeType = fieldChange.change_type;
    } else if (!fieldChange.oldValue && fieldChange.newValue) {
      changeType = "added";
    } else if (fieldChange.oldValue && !fieldChange.newValue) {
      changeType = "deleted";
    }

    return {
      changeType,
      changeData: {
        sourceTypeName: change.sourceTypeName ?? sourceTypeName,
        changeType,
        oldValue: fieldChange.oldValue,
        newValue: fieldChange.newValue,
        fields: change.fields ?? [],
      },
    };
  }

  return {
    changeType: change.changeType ?? null,
    changeData: {
      sourceTypeName: change.sourceTypeName ?? sourceTypeName,
      changeType: "modified",
      oldValue: null,
      newValue: null,
      fields: Array.isArray(change.fields) ? change.fields : [],
    },
  };
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
      if (!acc[change.activityName]) acc[change.activityName] = [];
      acc[change.activityName].push(change);
      return acc;
    },
    {} as Record<string, SourceTypeChange[]>,
  );
};
