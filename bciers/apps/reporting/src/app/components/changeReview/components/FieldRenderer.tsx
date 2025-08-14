import React from "react";
import { Box } from "@mui/material";
import { ChangeItemDisplay } from "@reporting/src/app/components/changeReview/templates/ChangeItemDisplay";
import StatusLabel from "@bciers/components/form/fields/StatusLabel";
import { generateDisplayLabel } from "@reporting/src/app/components/changeReview/utils/fieldUtils";
import { ChangeType } from "../../finalReview/templates/types";

// Function to render field changes in ChangeItemDisplay format
export const renderFieldChange = (
  field: any,
  label: string,
  indentLevel: number = 0,
): React.ReactNode => {
  if (!field || typeof field !== "object") {
    return null;
  }

  const isAdded = !field.old_value && field.new_value;
  const isDeleted = field.old_value && !field.new_value;

  // Math.random() is used here only for generating a unique React key for rendering purposes.
  const fieldKey = `${
    field.field || "field"
  }-${indentLevel}-${Date.now()}-${Math.random()}`;

  const changeItem = {
    field: field.field || "unknown",
    displayLabel: label,
    old_value: field.old_value,
    new_value: field.new_value,
    change_type: isAdded ? "added" : isDeleted ? "deleted" : "modified",
    isNewAddition: isAdded,
  };

  return (
    <Box key={fieldKey} ml={indentLevel * 2} mb={2}>
      <ChangeItemDisplay item={changeItem} isDeleted={isDeleted} />
    </Box>
  );
};

// Helper function to render field changes with proper status labels
export const renderFieldChanges = (
  oldObj: any,
  newObj: any,
  excludeKeys: string[] = [],
): React.ReactNode => {
  if (!oldObj && !newObj) return null;

  const oldKeys = oldObj ? Object.keys(oldObj) : [];
  const newKeys = newObj ? Object.keys(newObj) : [];
  const allKeys = Array.from(new Set([...oldKeys, ...newKeys]));

  const fieldsToProcess = allKeys.filter((key) => !excludeKeys.includes(key));

  if (fieldsToProcess.length === 0) return null;

  return (
    <Box ml={1}>
      {fieldsToProcess.map((key) => {
        const oldVal = oldObj?.[key];
        const newVal = newObj?.[key];
        const fieldLabel = generateDisplayLabel(key);

        if (
          (oldVal && typeof oldVal === "object" && !Array.isArray(oldVal)) ||
          (newVal && typeof newVal === "object" && !Array.isArray(newVal))
        ) {
          return (
            <Box key={key} mb={2}>
              <Box sx={{ fontWeight: "bold", mb: 1, color: "#38598A" }}>
                {fieldLabel}:
              </Box>
              <Box ml={2}>{renderFieldChanges(oldVal, newVal, [])}</Box>
            </Box>
          );
        }

        let changeType: ChangeType;
        let displayValue: any;

        if (oldVal === undefined && newVal !== undefined) {
          changeType = "added";
          displayValue = newVal;
        } else if (oldVal !== undefined && newVal === undefined) {
          changeType = "deleted";
          displayValue = oldVal;
        } else if (oldVal !== newVal) {
          changeType = "modified";
        } else {
          return null;
        }

        return (
          <Box
            key={key}
            mb={1}
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <Box sx={{ fontWeight: "medium", minWidth: "120px" }}>
              {fieldLabel}:
            </Box>

            {changeType === "added" && (
              <>
                <StatusLabel type="added" />
                <Box sx={{ color: "#2e7d32" }}>{String(displayValue)}</Box>
              </>
            )}

            {changeType === "deleted" && (
              <>
                <StatusLabel type="deleted" />
                <Box sx={{ color: "#d32f2f", textDecoration: "line-through" }}>
                  {String(displayValue)}
                </Box>
              </>
            )}

            {changeType === "modified" && (
              <ChangeItemDisplay
                item={{
                  field: key,
                  displayLabel: fieldLabel,
                  old_value: oldVal,
                  new_value: newVal,
                  change_type: "modified",
                }}
              />
            )}
          </Box>
        );
      })}
    </Box>
  );
};
