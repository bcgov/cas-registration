import React from "react";
import { Box } from "@mui/material";
import { ChangeItemDisplay } from "@reporting/src/app/components/changeReview/templates/ChangeItemDisplay";
import StatusLabel from "@bciers/components/form/fields/StatusLabel";
import { generateDisplayLabel } from "@reporting/src/app/components/changeReview/utils/fieldUtils";
export const renderFieldChange = (
  field: any,
  label: string,
  indentLevel: number = 0,
  suppressNestedStatus?: string[] | boolean,
): React.ReactNode => {
  if (!field || typeof field !== "object") return null;

  const { old_value, new_value } = field;
  const isAdded = old_value == null && new_value != null;
  const isDeleted = old_value != null && new_value == null;
  const isModified = !isAdded && !isDeleted && old_value !== new_value;

  const fieldKey = `${field.field || "field"}-${indentLevel}`;

  // Nested object → recurse
  if (
    (old_value && typeof old_value === "object" && !Array.isArray(old_value)) ||
    (new_value && typeof new_value === "object" && !Array.isArray(new_value))
  ) {
    // If indentLevel >= 2 (i.e., inside fuel/emission), don't render extra heading
    const shouldSuppressHeading = indentLevel >= 2;

    return (
      <Box key={fieldKey} ml={indentLevel * 2} mb={2}>
        {!shouldSuppressHeading && (
          <Box sx={{ fontWeight: "bold", mb: 1, color: "#38598A" }}>
            {label}{" "}
            {!suppressNestedStatus && isAdded && <StatusLabel type="added" />}
            {!suppressNestedStatus && isDeleted && (
              <StatusLabel type="deleted" />
            )}
            :
          </Box>
        )}
        <Box ml={shouldSuppressHeading ? 0 : 2}>
          {renderFieldChanges(
            old_value || {},
            new_value || {},
            suppressNestedStatus || isAdded,
          )}
        </Box>
      </Box>
    );
  }

  // Primitive value → Added / Deleted / Modified
  if (isAdded || isDeleted) {
    return (
      <Box
        key={fieldKey}
        ml={indentLevel * 2}
        mb={2}
        sx={{ display: "flex", gap: 1 }}
      >
        <Box sx={{ fontWeight: "bold", minWidth: "150px" }}>
          {label}{" "}
          {!suppressNestedStatus && isAdded && <StatusLabel type="added" />}
          {!suppressNestedStatus && isDeleted && <StatusLabel type="deleted" />}
          :
        </Box>
        <Box>{String(isAdded ? new_value : old_value)}</Box>
      </Box>
    );
  }

  if (isModified) {
    const changeItem = {
      field: field.field,
      old_value,
      new_value,
      change_type: "modified", // required for ChangeItemDisplay
      displayLabel: label,
    };

    return (
      <Box key={fieldKey} ml={indentLevel * 2} mb={2}>
        <ChangeItemDisplay item={changeItem} />
      </Box>
    );
  }

  return null; // No change
};

export const renderFieldChanges = (
  oldFields: Record<string, any> = {},
  newFields: Record<string, any> = {},
  suppressNestedStatus?: string[] | boolean,
): React.ReactNode => {
  if (!newFields) return null;

  const keys = Array.from(
    new Set([...Object.keys(oldFields || {}), ...Object.keys(newFields || {})]),
  );

  return (
    <Box>
      {keys.map((key) => {
        const oldValue = oldFields?.[key];
        const newValue = newFields?.[key];

        if (oldValue === newValue) return null;

        if (
          typeof newValue === "object" &&
          newValue !== null &&
          !Array.isArray(newValue)
        ) {
          return (
            <Box key={key} sx={{ ml: 2 }}>
              {renderFieldChange(
                {
                  old_value: oldValue,
                  new_value: newValue,
                  field: key,
                },
                generateDisplayLabel(key),
                0,
                suppressNestedStatus || oldValue == null,
              )}
            </Box>
          );
        }

        return renderFieldChange(
          {
            old_value: oldValue,
            new_value: newValue,
            field: key,
          },
          generateDisplayLabel(key),
          0,
          suppressNestedStatus,
        );
      })}
    </Box>
  );
};
