import React from "react";
import { Box, Typography } from "@mui/material";
import { ChangeItem } from "../constants/types";
import { groupActivityChanges } from "@reporting/src/app/components/changeReview/utils/activityViewHelpers";
import { ActivityDiffView } from "./ActivityDiffView";

export interface SimpleActivityDiffProps {
  /** Flat list of change items to display. */
  changes: ChangeItem[];
  /** When true, facility name headers are omitted (useful when the facility is already shown in a parent). */
  hideFacilityHeaders?: boolean;
}

/**
 * Renders a hierarchical diff view for activity-data changes grouped by
 * facility → activity → source type.
 *
 * - Whole-activity additions/removals use `ActivityView`.
 * - Whole-source-type additions/removals are shown inside a `SourceTypeBoxTemplate`.
 * - Field-level changes are rendered as a recursive diff tree.
 */
export const SimpleActivityDiff: React.FC<SimpleActivityDiffProps> = ({
  changes,
  hideFacilityHeaders = false,
}) => {
  const grouped = groupActivityChanges(changes);

  return (
    <div>
      {Object.entries(grouped).map(([facilityName, activities]) => (
        <Box key={facilityName} mb={4}>
          {!hideFacilityHeaders && (
            <Typography variant="h6" fontWeight={700}>
              {facilityName}
            </Typography>
          )}

          {Object.entries(activities).map(([activityName, activityGroup]) => (
            <ActivityDiffView
              activityName={activityName}
              activityGroup={activityGroup}
            />
          ))}
        </Box>
      ))}
    </div>
  );
};

export default SimpleActivityDiff;
