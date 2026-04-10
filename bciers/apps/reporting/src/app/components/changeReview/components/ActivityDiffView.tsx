import { Box, Typography } from "@mui/material";
import { ActivityGroup, getChangeValue } from "../utils/activityViewHelpers";
import ActivityView from "../../finalReview/templates/ActivityView";
import { ChangeItem } from "../constants/types";
import { BC_GOV_BACKGROUND_COLOR_BLUE } from "@bciers/styles/colors";
import { SourceTypeDiffView } from "./SourceTypeDiffView";

interface WholeActivityDiffViewProps {
  activityName: string;
  changeItem: ChangeItem;
}

interface ActivityDiffViewProps {
  activityName: string;
  activityGroup: ActivityGroup;
}

export const WholeActivityDiffView: React.FC<WholeActivityDiffViewProps> = ({
  activityName,
  changeItem,
}) => {
  const value = getChangeValue(changeItem);
  return (
    <Box key={activityName} mt={2}>
      <ActivityView
        activity_data={[
          {
            activity: activityName,
            source_types: value?.source_types ?? {},
          },
        ]}
        changeType={changeItem.change_type}
      />
    </Box>
  );
};

export const PartialActivityDiffView: React.FC<ActivityDiffViewProps> = ({
  activityName,
  activityGroup,
}) => {
  // Only some source types (or their fields) changed
  return (
    <Box key={activityName} mt={2}>
      <Typography
        sx={{
          fontSize: "1.2rem",
          color: BC_GOV_BACKGROUND_COLOR_BLUE,
          fontWeight: "bold",
          mb: 1,
        }}
      >
        {activityName}
      </Typography>

      {Object.entries(activityGroup.sourceTypes).map(
        ([sourceTypeName, stGroup]) => (
          <SourceTypeDiffView
            sourceTypeGroup={stGroup}
            sourceTypeName={sourceTypeName}
          />
        ),
      )}
    </Box>
  );
};

export const ActivityDiffView: React.FC<ActivityDiffViewProps> = ({
  activityName,
  activityGroup,
}) => {
  if (activityGroup.whole)
    return (
      <WholeActivityDiffView
        activityName={activityName}
        changeItem={activityGroup.whole}
      />
    );

  return (
    <PartialActivityDiffView
      activityName={activityName}
      activityGroup={activityGroup}
    />
  );
};
