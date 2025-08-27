import React from "react";
import { Box } from "@mui/material";
import { generateDisplayLabel } from "@reporting/src/app/components/changeReview/utils/fieldUtils";
import { ChangeItemDisplay } from "@reporting/src/app/components/changeReview/templates/ChangeItemDisplay";
import StatusLabel from "@bciers/components/form/fields/StatusLabel";
import {
  isWholeObjectAdded,
  isWholeObjectDeleted,
} from "@reporting/src/app/components/changeReview/utils/utils";

// Render a single field
export const renderFieldChange = (
  field: any,
  label: string,
  indent: number = 0,
  parentWholeObjectStatus: "added" | "deleted" | null = null,
): React.ReactNode => {
  if (!field) return null;

  const { oldValue, newValue } = field;
  const isAdded = oldValue == null && newValue != null;
  const isDeleted = oldValue != null && newValue == null;

  // skip unchanged fields
  if (oldValue === newValue) return null;

  const isPlainObject = (val: any) =>
    val && typeof val === "object" && !Array.isArray(val);

  if (isPlainObject(oldValue) || isPlainObject(newValue)) {
    const keys = Array.from(
      new Set([
        ...(isPlainObject(oldValue) ? Object.keys(oldValue) : []),
        ...(isPlainObject(newValue) ? Object.keys(newValue) : []),
      ]),
    );
    return (
      <Box key={label} ml={indent}>
        {keys.map((key) =>
          renderFieldChange(
            {
              field: key,
              oldValue: oldValue?.[key],
              newValue: newValue?.[key],
            },
            key,
            indent + 1,
            parentWholeObjectStatus,
          ),
        )}
      </Box>
    );
  }

  if (Array.isArray(oldValue) || Array.isArray(newValue)) {
    const maxLen = Math.max(
      Array.isArray(oldValue) ? oldValue.length : 0,
      Array.isArray(newValue) ? newValue.length : 0,
    );
    return (
      <Box key={label} ml={indent}>
        {Array.from({ length: maxLen }, (_, idx) =>
          renderFieldChange(
            {
              field: `${label}-${idx}`,
              oldValue: oldValue?.[idx],
              newValue: newValue?.[idx],
            },
            `${label} ${idx + 1}`,
            indent + 1,
            parentWholeObjectStatus,
          ),
        )}
      </Box>
    );
  }

  // If the parent object is fully added/deleted, don't show field StatusLabel
  const showFieldStatus = parentWholeObjectStatus === null;

  return (
    <ChangeItemDisplay
      item={{
        field: label,
        oldValue,
        newValue,
        change_type: isAdded ? "added" : isDeleted ? "deleted" : "modified",
        isNewAddition: showFieldStatus && isAdded,
      }}
      isDeleted={showFieldStatus && isDeleted}
    />
  );
};

// Render arrays (Unit, Fuel, Emission)
const renderArrayChanges = (
  type: string,
  oldArr: any[] = [],
  newArr: any[] = [],
  ml: number = 2,
  labelSize: string = "1rem",
): React.ReactNode => {
  const maxLen = Math.max(oldArr.length, newArr.length);
  if (maxLen === 0) return null;

  return (
    <>
      {Array.from({ length: maxLen }, (_, idx) => {
        const oldItem = oldArr[idx];
        const newItem = newArr[idx];

        const wholeAdded = isWholeObjectAdded(oldItem, newItem);
        const wholeDeleted = isWholeObjectDeleted(oldItem, newItem);

        const itemLabel = `${type} ${idx + 1}`;

        return (
          <Box key={`${type}-${idx}`} ml={ml} mb={2}>
            {/* Header with StatusLabel only if whole object is added/deleted */}
            <Box
              sx={{
                fontWeight: "bold",
                mb: 1,
                fontSize: labelSize,
                color: wholeAdded || wholeDeleted ? "#38598A" : "#222",
              }}
            >
              {itemLabel}
              {wholeAdded && <StatusLabel type="added" />}
              {wholeDeleted && <StatusLabel type="deleted" />}
            </Box>

            {/* Render fields */}
            {(newItem?.fields || oldItem?.fields || []).map((f: any) =>
              renderFieldChange(
                f,
                generateDisplayLabel(f.field),
                ml + 1,
                wholeAdded ? "added" : wholeDeleted ? "deleted" : null,
              ),
            )}

            {/* Nested Fuels under Unit */}
            {type === "Unit" &&
              renderArrayChanges(
                "Fuel",
                oldItem?.fuels ? Object.values(oldItem.fuels) : [],
                newItem?.fuels ? Object.values(newItem.fuels) : [],
                ml + 1,
              )}

            {/* Nested Emissions under Fuel */}
            {type === "Fuel" &&
              renderArrayChanges(
                "Emission",
                oldItem?.emissions ? Object.values(oldItem.emissions) : [],
                newItem?.emissions ? Object.values(newItem.emissions) : [],
                ml + 1,
                "0.9rem",
              )}
          </Box>
        );
      })}
    </>
  );
};

// Top-level renderers
export const renderUnitsChanges = (unitsData: any) => {
  if (!unitsData || typeof unitsData !== "object") return null;
  return (
    <Box>
      {Object.values(unitsData).map((unitData: any, idx: number) =>
        renderArrayChanges("Unit", [], [unitData], idx, "1.1rem"),
      )}
    </Box>
  );
};

export const renderFuelsChanges = (oldFuels: any[], newFuels: any[]) =>
  renderArrayChanges("Fuel", oldFuels, newFuels, 2);

export const renderEmissionsChanges = (
  oldEmissions: any[],
  newEmissions: any[],
) => renderArrayChanges("Emission", oldEmissions, newEmissions, 4);

export const renderNestedSourceTypeChanges = (sourceTypeData: any) =>
  renderUnitsChanges(sourceTypeData.units || {});
