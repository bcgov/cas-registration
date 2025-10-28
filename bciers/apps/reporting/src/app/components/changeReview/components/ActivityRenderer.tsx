// File: `ActivityRenderer.tsx`
import React from "react";
import { Box } from "@mui/material";
import ActivityView from "../../finalReview/templates/ActivityView";
import { SourceTypeRenderer } from "./SourceTypeRenderer";
import { styles } from "@reporting/src/app/components/changeReview/constants/styles";
import { ActivityRendererProps } from "@reporting/src/app/components/changeReview/constants/types";
import { isNonEmptyValue } from "@reporting/src/app/components/changeReview/utils/utils";
import { BC_GOV_BACKGROUND_COLOR_BLUE } from "@bciers/styles";

// Renders an activity and its source types, handling added, deleted, and modified cases
export const ActivityRenderer: React.FC<ActivityRendererProps> = ({
  activityName,
  activity,
  addedActivities,
  deletedActivities,
  sourceTypeChangesForActivity,
}) => {
  // Render for added activities
  if (addedActivities && addedActivities.length > 0) {
    return (
      <>
        {addedActivities.map((addedActivity, idx) => (
          <Box key={`${activityName}-added-${idx}`} mb={3}>
            <ActivityView
              activity_data={
                isNonEmptyValue(addedActivity) ? [addedActivity] : []
              }
              changeType="added"
            />
          </Box>
        ))}
      </>
    );
  }

  // Render for deleted activities
  if (deletedActivities && deletedActivities.length > 0) {
    return (
      <>
        {deletedActivities.map((deletedActivity, idx) => (
          <Box key={`${activityName}-deleted-${idx}`} mb={3}>
            <ActivityView
              activity_data={
                isNonEmptyValue(deletedActivity) ? [deletedActivity] : []
              }
              changeType="deleted"
            />
          </Box>
        ))}
      </>
    );
  }

  // Handle modified activities
  // Cast activity to any and explicitly type sourceTypes so string indexing is allowed
  const activityAny = activity as any;
  const sourceTypes: Record<string, any> =
    activityAny.sourceTypes ||
    activityAny.newValue?.source_types ||
    activityAny.oldValue?.source_types ||
    {};

  // Filter out keys that are not source type names (they're structure keys like "units", "fuels", "emissions")
  const isSourceTypeName = (key: string) => {
    const structureKeys = [
      "units",
      "fuels",
      "emissions",
      "gscUnitName",
      "gscUnitType",
      "gscUnitDescription",
      "description",
    ];
    return !structureKeys.includes(key);
  };

  // Merge keys from activity data and source-type change records so added/deleted source-types appear
  const changeNames = (sourceTypeChangesForActivity || []).map(
    (c) => c.sourceTypeName,
  );
  const sourceTypeKeys = Object.keys(sourceTypes || {}).filter(
    isSourceTypeName,
  );
  const allNames = Array.from(new Set([...sourceTypeKeys, ...changeNames]));

  return (
    <Box key={activityName} mb={3} style={styles.sourceCard}>
      <Box
        className="font-bold"
        sx={{ fontSize: "1.2rem", color: BC_GOV_BACKGROUND_COLOR_BLUE, mb: 2 }}
      >
        {activityName}
      </Box>
      {allNames
        .sort((a, b) => {
          const aEm = a.toLowerCase().includes("emissions");
          const bEm = b.toLowerCase().includes("emissions");
          return aEm === bEm ? 0 : aEm ? 1 : -1;
        })
        .map((sourceTypeName, idx) => {
          // Prefer the activity-provided value; fall back to change newValue/oldValue if available
          const changeForName = (sourceTypeChangesForActivity || []).find(
            (c) => c.sourceTypeName === sourceTypeName,
          );
          const sourceTypeValue =
            sourceTypes[sourceTypeName] ||
            changeForName?.newValue ||
            changeForName?.oldValue ||
            {};

          return (
            <SourceTypeRenderer
              key={`${sourceTypeName}-${idx}`}
              sourceTypeName={sourceTypeName}
              sourceTypeValue={sourceTypeValue}
              sourceTypeIndex={idx}
              sourceTypeChangesForActivity={sourceTypeChangesForActivity}
            />
          );
        })}
    </Box>
  );
};
