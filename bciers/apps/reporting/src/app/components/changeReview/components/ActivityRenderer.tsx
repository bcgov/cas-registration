import React from "react";
import { Box } from "@mui/material";
import ActivityView from "../../finalReview/templates/ActivityView";
import { SourceTypeRenderer } from "./SourceTypeRenderer";
import { styles } from "@reporting/src/app/components/changeReview/constants/styles";
import { ActivityRendererProps } from "@reporting/src/app/components/changeReview/constants/types";
import {
  isNonEmptyValue,
  normalizeChangeType,
} from "@reporting/src/app/components/changeReview/utils/utils";

// Renders an activity and its source types, handling added, deleted, and modified cases
export const ActivityRenderer: React.FC<ActivityRendererProps> = ({
  activityName,
  activity,
  sourceTypeChangesForActivity,
}) => {
  const activityChangeType = normalizeChangeType(activity.changeType);
  if (["added", "deleted"].includes(activityChangeType)) {
    const activityData = activity.newValue || activity.oldValue;
    const viewChangeType = activityChangeType as "added" | "deleted";
    return (
      <Box key={activityName} mb={3}>
        <ActivityView
          activity_data={isNonEmptyValue(activityData) ? [activityData] : []}
          changeType={viewChangeType}
        />
      </Box>
    );
  }

  // Handle modified activity
  // Renders all source types for the activity, sorted so emissions are last
  const sourceTypes =
    activity.sourceTypes ||
    activity.newValue?.source_types ||
    activity.oldValue?.source_types ||
    {};
  return (
    <Box key={activityName} mb={3} style={styles.sourceCard}>
      <Box
        className="font-bold"
        sx={{ fontSize: "1.2rem", color: "#38598A", mb: 2 }}
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
