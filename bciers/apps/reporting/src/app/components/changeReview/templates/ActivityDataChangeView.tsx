import React from "react";
import { Box } from "@mui/material";
import { ActivityRenderer } from "../components/ActivityRenderer";
import { groupSourceTypeChangesByActivity } from "../utils/sourceTypeUtils";
import { ActivityDataChangeViewProps } from "../../finalReview/templates/types";

export const ActivityDataChangeView: React.FC<ActivityDataChangeViewProps> = ({
  activities,
  addedActivities = [],
  deletedActivities = [],
  sourceTypeChanges = [],
}) => {
  const sourceTypeChangesByActivity =
    groupSourceTypeChangesByActivity(sourceTypeChanges);

  return (
    <Box>
      {Object.entries(activities).map(([activityName, activity]) => {
        const sourceTypeChangesForActivity =
          sourceTypeChangesByActivity[activityName] || [];

        // Filter added and deleted activities specific to the current activity
        const filteredAddedActivities = addedActivities.filter(
          (added) => added.activity === activityName,
        );
        const filteredDeletedActivities = deletedActivities.filter(
          (deleted) => deleted.activity === activityName,
        );

        return (
          <ActivityRenderer
            key={activityName}
            activityName={activityName}
            activity={activity}
            addedActivities={filteredAddedActivities} // Only pass relevant added activities
            deletedActivities={filteredDeletedActivities} // Only pass relevant deleted activities
            sourceTypeChangesForActivity={sourceTypeChangesForActivity}
          />
        );
      })}
    </Box>
  );
};
