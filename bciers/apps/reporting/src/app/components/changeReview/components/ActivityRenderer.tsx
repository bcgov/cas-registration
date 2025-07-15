import React from "react";
import { Box } from "@mui/material";
import ActivityView from "../../finalReview/templates/ActivityView";
import { SourceTypeRenderer } from "./SourceTypeRenderer";
import { styles } from "@reporting/src/app/components/changeReview/constants/styles";
import {
  SourceTypeChange,
  ChangeType,
} from "../../finalReview/templates/types";

interface ActivityRendererProps {
  activityName: string;
  activity: any;
  sourceTypeChangesForActivity: SourceTypeChange[];
  isModifiedActivity?: boolean;
}

export const ActivityRenderer: React.FC<ActivityRendererProps> = ({
  activityName,
  activity,
  sourceTypeChangesForActivity,
  isModifiedActivity = false,
}) => {
  const activityChangeType: ChangeType = activity.changeType || "modified";

  // Handle Added activity
  if (activityChangeType === "added") {
    const activityData = activity.new_value ? [activity.new_value] : [];
    return (
      <Box key={activityName} mb={3}>
        <ActivityView activity_data={activityData} changeType="added" />
      </Box>
    );
  }

  // Handle Deleted activity
  if (activityChangeType === "deleted") {
    const activityData = activity.old_value ? [activity.old_value] : [];
    return (
      <Box key={activityName} mb={3}>
        <ActivityView activity_data={activityData} changeType="deleted" />
      </Box>
    );
  }

  if (activityChangeType === "modified") {
    const sourceTypes = isModifiedActivity
      ? activity.new_value?.source_types || {}
      : activity.sourceTypes || {};

    return (
      <Box key={activityName} mb={3} style={styles.sourceCard}>
        <Box
          className="font-bold"
          sx={{ fontSize: "1.2rem", color: "#38598A", mb: 2 }}
        >
          {isModifiedActivity ? activity.activity : activityName}
        </Box>

        {Object.entries(sourceTypes)
          .sort(([keyA], [keyB]) => {
            if (keyA.toLowerCase().includes("emissions")) return 1;
            if (keyB.toLowerCase().includes("emissions")) return -1;
            return 0;
          })
          .map(([sourceTypeName, sourceTypeValue], sourceTypeIndex) => (
            <SourceTypeRenderer
              key={sourceTypeIndex}
              sourceTypeName={sourceTypeName}
              sourceTypeValue={sourceTypeValue}
              sourceTypeIndex={sourceTypeIndex}
              sourceTypeChangesForActivity={sourceTypeChangesForActivity}
            />
          ))}
      </Box>
    );
  }
  return null;
};
