import React from "react";
import { Box, Typography } from "@mui/material";
import ActivityView from "../../finalReview/templates/ActivityView";
import SourceTypeBoxTemplate from "@bciers/components/form/fields/SourceTypeBoxTemplate";
import { renderObject as renderActivityObject } from "../utils/activityRenderUtils";
import { ChangeItem } from "../constants/types";
import { dataCardStyle } from "../constants/styles";
import { BC_GOV_BACKGROUND_COLOR_BLUE } from "@bciers/styles";
import {
  getChangeValue,
  groupActivityChanges,
  parseSegments,
  renderDiffTree,
  SegmentedChange,
} from "@reporting/src/app/components/changeReview/utils/activityViewHelpers";

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

          {Object.entries(activities).map(([activityName, activityGroup]) => {
            // Entire activity was added or removed — delegate to ActivityView
            if (activityGroup.whole) {
              const { whole: change } = activityGroup;
              const value = getChangeValue(change);
              return (
                <Box key={activityName} mt={2}>
                  <ActivityView
                    activity_data={[
                      {
                        activity: activityName,
                        source_types: value?.source_types ?? {},
                      },
                    ]}
                    changeType={change.change_type as "added" | "removed"}
                  />
                </Box>
              );
            }

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
                  ([sourceTypeName, stGroup]) => {
                    const sharedProps = {
                      key: sourceTypeName,
                      classNames: "source-type-box",
                      label: sourceTypeName,
                      readonly: false,
                    };

                    // Entire source type was added or removed
                    if (stGroup.whole) {
                      const { whole: change } = stGroup;
                      const value = getChangeValue(change);
                      return (
                        <SourceTypeBoxTemplate
                          {...sharedProps}
                          sourceTypeChange={{
                            type: change.change_type as "added" | "removed",
                          }}
                          isDeleted={change.change_type === "removed"}
                          description={
                            <div style={dataCardStyle}>
                              {renderActivityObject(
                                value,
                                "",
                                change.change_type === "removed",
                              )}
                            </div>
                          }
                        />
                      );
                    }

                    // Individual fields within the source type changed — render diff tree
                    const segmentedChanges: SegmentedChange[] =
                      stGroup.fields.map(({ path, change }) => ({
                        segs: parseSegments(path),
                        change,
                      }));

                    return (
                      <SourceTypeBoxTemplate
                        {...sharedProps}
                        description={
                          <Box ml={1}>{renderDiffTree(segmentedChanges)}</Box>
                        }
                      />
                    );
                  },
                )}
              </Box>
            );
          })}
        </Box>
      ))}
    </div>
  );
};

export default SimpleActivityDiff;
