import React from "react";
import { Box } from "@mui/material";
import { StatusLabel } from "@bciers/components/form/fields/StatusLabel";
import { ChangeItem, ChangeType } from "../constants/types";
import { ChangeItemDisplay } from "@reporting/src/app/components/changeReview/templates/ChangeItemDisplay";

const NON_ATTR_LABELS: Record<string, string> = {
  activity: "Activity Name",
  source_type: "Source Type",
  emission_category: "Emission Category",
  gas_type: "Gas Type",
};

interface Props {
  change: ChangeItem;
}

export const NonAttributableEmissionItem: React.FC<Props> = ({ change }) => {
  const newObj =
    change.newValue && typeof change.newValue === "object"
      ? (change.newValue as Record<string, any>)
      : null;
  const oldObj =
    change.oldValue && typeof change.oldValue === "object"
      ? (change.oldValue as Record<string, any>)
      : null;

  const inferredKey =
    change.field
      .split(/[[\]']+/)
      .filter(Boolean)
      .at(-1) ?? "value";
  const changeType: ChangeType =
    oldObj && !newObj ? "removed" : !oldObj && newObj ? "added" : "modified";

  // Object case: grouped entry — show one badge for the group, suppress per-field badges
  if (newObj || oldObj) {
    const items = Array.from(
      new Set([...Object.keys(oldObj ?? {}), ...Object.keys(newObj ?? {})]),
    )
      .filter((k) => (oldObj?.[k] ?? null) !== (newObj?.[k] ?? null))
      .map((k) => ({
        field: k,
        displayLabel: NON_ATTR_LABELS[k] || k,
        oldValue: oldObj?.[k] ?? null,
        newValue: newObj?.[k] ?? null,
        change_type: changeType,
      }));

    return (
      <Box mb={2}>
        {changeType !== "modified" && <StatusLabel type={changeType} />}
        {items.map((item) => (
          <ChangeItemDisplay
            key={item.field}
            item={item}
            parentWholeObjectStatus
          />
        ))}
      </Box>
    );
  }

  // Scalar case: single field — let ChangeItemDisplay render its own badge inline
  return (
    <Box mb={2}>
      <ChangeItemDisplay
        item={{
          ...change,
          displayLabel: NON_ATTR_LABELS[inferredKey] || inferredKey,
        }}
      />
    </Box>
  );
};
