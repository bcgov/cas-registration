import React from "react";
import { Box } from "@mui/material";
import ActivityView from "../../finalReview/templates/ActivityView";
import { ActivityRenderer } from "../components/ActivityRenderer";
import { groupSourceTypeChangesByActivity } from "../utils/sourceTypeUtils";
import { ActivityDataChangeViewProps } from "../../finalReview/templates/types";

export const ActivityDataChangeView: React.FC<ActivityDataChangeViewProps> = ({
  activities,
  addedActivities,
  sourceTypeChanges = [],
  deletedActivities = [],
}) => {
  const sourceTypeChangesByActivity =
    groupSourceTypeChangesByActivity(sourceTypeChanges);

  // Helper to filter out activities with only name and change_type, or only empty fields
  const filterValidActivities = (filteredActivities: any[]) =>
    filteredActivities.filter((activity) => {
      // Get all keys except 'activity' and 'change_type'
      const keys = Object.keys(activity).filter(
        (key) => key !== "activity" && key !== "change_type",
      );
      // Only include if at least one key has a non-empty, non-null, non-undefined value
      return keys.some((key) => {
        const value = activity[key];
        if (Array.isArray(value)) return value.length > 0;
        if (typeof value === "object" && value !== null)
          return Object.keys(value).length > 0;
        return value !== undefined && value !== null && value !== "";
      });
    });

  // Helper to deduplicate activities by activity name and change_type
  const deduplicateActivities = (filteredActivities: any[]) => {
    const seen = new Set();
    return filteredActivities.filter((activity) => {
      const key = `${activity.activity}-${activity.change_type}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  return (
    <Box>
      {/* Added activities */}
      {addedActivities && addedActivities.length > 0 && (
        <Box mb={3}>
          <ActivityView
            activity_data={filterValidActivities(addedActivities)}
            changeType="added"
          />
        </Box>
      )}

      {/* Deleted activities */}
      {deletedActivities &&
        filterValidActivities(deduplicateActivities(deletedActivities)).length >
          0 && (
          <Box mb={3}>
            <ActivityView
              activity_data={filterValidActivities(
                deduplicateActivities(deletedActivities),
              )}
              changeType="deleted"
            />
          </Box>
        )}

      {/* Existing activity changes (not added or deleted) */}
      {Object.entries(activities)
        .filter(
          ([, activity]) =>
            activity.change_type !== "added" &&
            activity.change_type !== "deleted",
        )
        .map(([activityName, activity]) => {
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
