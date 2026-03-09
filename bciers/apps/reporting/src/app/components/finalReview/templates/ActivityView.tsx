import React from "react";
import SourceTypeBoxTemplate from "@bciers/components/form/fields/SourceTypeBoxTemplate";
import StatusLabel from "@bciers/components/form/fields/StatusLabel";
import { ActivityItem } from "@reporting/src/app/components/changeReview/constants/types";
import {
  getDeletedStyles,
  renderFuels,
  renderObject,
} from "@reporting/src/app/components/changeReview/utils/activityRenderUtils";
import {
  getSourceTypeChange,
  isDisplayableSourceType,
  getDisplayName,
} from "@reporting/src/app/components/changeReview/utils/activityViewHelpers";
import { dataCardStyle } from "@reporting/src/app/components/changeReview/constants/styles";
import { ActivitiesViewProps } from "@reporting/src/app/components/finalReview/reportTypes";

export default function ActivityView({
  activity_data,
  isAdded = false,
  isDeleted = false,
  changeType,
  sourceTypeChange,
}: ActivitiesViewProps) {
  const activityIsAdded = isAdded || changeType === "added";
  const activityIsDeleted = isDeleted || changeType === "removed";
  const deletedStyles = getDeletedStyles(activityIsDeleted);

  const activitiesArray: ActivityItem[] = Array.isArray(activity_data)
    ? activity_data
    : Object.entries(activity_data).map(([activityName, activityData]) => ({
        activity: activityName,
        source_types: activityData?.source_types ?? activityData,
      }));

  return (
    <div>
      {activitiesArray.map((activityItem, activityIndex) => (
        <section key={activityIndex} style={{ marginBottom: 30 }}>
          <h2 className="py-2 font-bold text-bc-bg-blue" style={deletedStyles}>
            {activityItem.activity}
            {activityIsAdded && <StatusLabel type="added" />}
            {activityIsDeleted && <StatusLabel type="removed" />}
          </h2>

          {Object.entries(activityItem.source_types ?? {})
            .filter(([, v]) => isDisplayableSourceType(v))
            .sort(([a], [b]) => {
              if (a.toLowerCase().includes("emissions")) return 1;
              if (b.toLowerCase().includes("emissions")) return -1;
              return 0;
            })
            .map(([sourceTypeName, sourceTypeValue], sourceTypeIndex) => {
              const displayName = getDisplayName(sourceTypeName);
              const isSourceTypeDeleted =
                sourceTypeChange?.deletedSourceTypes?.some(
                  (st) => st.name === sourceTypeName,
                );
              const stIsDeleted = activityIsDeleted || isSourceTypeDeleted;
              const stChange = getSourceTypeChange(
                sourceTypeName,
                sourceTypeChange,
                activityIsAdded,
                isSourceTypeDeleted || false,
              );

              // Fuel source types: show only name/unit summary row
              if (sourceTypeName.toLowerCase().includes("fuels")) {
                return (
                  <div key={sourceTypeIndex}>
                    {renderFuels(sourceTypeValue, deletedStyles)}
                  </div>
                );
              }

              // All other source types: arrays pass key as labelPrefix for "N+1" headings,
              // objects render recursively with no prefix.
              const content = Array.isArray(sourceTypeValue)
                ? renderObject(sourceTypeValue, sourceTypeName, stIsDeleted)
                : renderObject(sourceTypeValue, "", stIsDeleted);

              return (
                <SourceTypeBoxTemplate
                  key={sourceTypeIndex}
                  classNames="source-type-box"
                  label={displayName}
                  description={<div style={dataCardStyle}>{content}</div>}
                  readonly={false}
                  isDeleted={stIsDeleted}
                  sourceTypeChange={stChange}
                />
              );
            })}
        </section>
      ))}
    </div>
  );
}
