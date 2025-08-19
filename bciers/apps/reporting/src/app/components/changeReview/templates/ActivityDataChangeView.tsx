import React from "react";
import { Box } from "@mui/material";
import { ActivityRenderer } from "../components/ActivityRenderer";
import { groupSourceTypeChangesByActivity } from "../utils/sourceTypeUtils";
import { ActivityDataChangeViewProps } from "../../finalReview/templates/types";

export const ActivityDataChangeView: React.FC<ActivityDataChangeViewProps> = ({
  activities,
  sourceTypeChanges = [],
}) => {
  const sourceTypeChangesByActivity =
    groupSourceTypeChangesByActivity(sourceTypeChanges);

  return (
    <Box>
      {Object.entries(activities).map(([activityName, activity]) => {
        const sourceTypeChangesForActivity =
          sourceTypeChangesByActivity[activityName] || [];
        return (
          <ActivityRenderer
            key={activityName}
            activityName={activityName}
            activity={activity}
            sourceTypeChangesForActivity={sourceTypeChangesForActivity}
            isModifiedActivity={false}
          />
        );
      })}
    </Box>
  );
};
