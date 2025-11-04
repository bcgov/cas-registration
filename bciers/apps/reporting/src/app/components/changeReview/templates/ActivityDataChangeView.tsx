// File: `ActivityDataChangeView.tsx`
import React from "react";
import { Box } from "@mui/material";
import { ActivityRenderer } from "../components/ActivityRenderer";
import { groupSourceTypeChangesByActivity } from "../utils/sourceTypeUtils";
import { ActivityDataChangeViewProps } from "../../finalReview/templates/types";
import { normalize } from "@reporting/src/app/components/changeReview/utils/utils";

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
        const key = normalize(activityName);

        // Try normalized key first, fall back to raw activityName if grouping uses raw keys
        const sourceTypeChangesForActivity =
          sourceTypeChangesByActivity[key] ||
          sourceTypeChangesByActivity[activityName] ||
          [];

        // Filter added and deleted activities specific to the current activity (normalized)
        const filteredAddedActivities = (addedActivities || []).filter(
          (added) => normalize(added.activity) === key,
        );
        const filteredDeletedActivities = (deletedActivities || []).filter(
          (deleted) => normalize(deleted.activity) === key,
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
