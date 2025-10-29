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
  // If the activity is neither added nor deleted, treat it as modified
  const sourceTypes =
    activity.sourceTypes ||
    activity.newValue?.source_types ||
    activity.oldValue?.source_types ||
    {};

  return (
    <Box key={activityName} mb={3} style={styles.sourceCard}>
      <Box
        className="font-bold"
        sx={{ fontSize: "1.2rem", color: BC_GOV_BACKGROUND_COLOR_BLUE, mb: 2 }}
      >
        {activityName}
      </Box>
      {Object.entries(sourceTypes)
        .sort(([keyA], [keyB]) => {
          const aEm = keyA.toLowerCase().includes("emissions");
          const bEm = keyB.toLowerCase().includes("emissions");
          return aEm === bEm ? 0 : aEm ? 1 : -1;
        })
        .map(([sourceTypeName, sourceTypeValue], idx) => (
          <SourceTypeRenderer
            key={idx}
            sourceTypeName={sourceTypeName}
            sourceTypeValue={sourceTypeValue}
            sourceTypeIndex={idx}
            sourceTypeChangesForActivity={sourceTypeChangesForActivity}
          />
        ))}
    </Box>
  );
};
