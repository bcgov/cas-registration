import React from "react";
import SourceTypeBoxTemplate from "@bciers/components/form/fields/SourceTypeBoxTemplate";
import { SourceTypeCard } from "./SourceTypeCard";
import { renderObject } from "./ObjectRenderer";
import {
  detectSourceTypeChanges,
  hasNestedChanges,
} from "@reporting/src/app/components/changeReview/utils/sourceTypeUtils";
import { styles } from "@reporting/src/app/components/changeReview/constants/styles";
import { SourceTypeChange } from "../../finalReview/templates/types";

interface SourceTypeRendererProps {
  sourceTypeName: string;
  sourceTypeValue: any;
  sourceTypeIndex: number;
  sourceTypeChangesForActivity: SourceTypeChange[];
}

export const SourceTypeRenderer: React.FC<SourceTypeRendererProps> = ({
  sourceTypeName,
  sourceTypeValue,
  sourceTypeIndex,
  sourceTypeChangesForActivity,
}) => {
  // Detect source type changes
  const { changeType: sourceTypeChangeType, changeData } =
    detectSourceTypeChanges(
      sourceTypeName,
      sourceTypeValue,
      sourceTypeChangesForActivity,
    );

  // Handle special cases for fuels display
  if (sourceTypeName.toLowerCase().includes("fuels")) {
    return (
      <div key={sourceTypeIndex} style={styles.dataCard}>
        {Object.entries(sourceTypeValue).map(([key, value]) => {
          if (
            key.toLowerCase() === "fuel name" ||
            key.toLowerCase() === "fuel unit"
          ) {
            return (
              <div key={key} style={{ marginBottom: 4 }}>
                <strong>
                  {key
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (s) => s.toUpperCase())}
                </strong>
                <span>{`: ${String(value)}`}</span>
              </div>
            );
          }
          return null;
        })}
      </div>
    );
  }

  // Check if this is a modified source type with nested changes
  const hasNestedStructureChanges = hasNestedChanges(
    sourceTypeValue,
    sourceTypeChangeType,
  );

  // If source type is added or deleted, use SourceTypeBoxTemplate
  if (sourceTypeChangeType === "added" || sourceTypeChangeType === "deleted") {
    let displayValue = sourceTypeValue;
    let displayName = sourceTypeName;

    if (changeData) {
      displayName = changeData.sourceTypeName || sourceTypeName;

      if (sourceTypeChangeType === "added" && changeData.newValue) {
        displayValue = changeData.newValue;
      } else if (sourceTypeChangeType === "deleted" && changeData.oldValue) {
        displayValue = changeData.oldValue;
      }
    }

    const sourceTypeProps: any = {
      key: sourceTypeIndex,
      classNames: "source-type-box",
      label: displayName,
      description: (
        <div style={styles.dataCard}>
          {typeof displayValue === "object"
            ? renderObject(displayValue, "", sourceTypeChangeType === "deleted")
            : String(displayValue)}
        </div>
      ),
      readonly: false,
    };

    if (sourceTypeChangeType === "added") {
      sourceTypeProps.sourceTypeChange = { type: "added" };
    } else if (sourceTypeChangeType === "deleted") {
      sourceTypeProps.isDeleted = true;
      sourceTypeProps.sourceTypeChange = { type: "deleted" };
    }

    return <SourceTypeBoxTemplate {...sourceTypeProps} />;
  }

  // For all other cases (modified or nested changes), use SourceTypeCard
  if (hasNestedStructureChanges || sourceTypeChangeType === "modified") {
    const modifiedChangeData = changeData || {
      sourceTypeName: sourceTypeName,
      changeType: "modified",
      oldValue: {},
      newValue: sourceTypeValue,
      fields: [],
    };

    return (
      <SourceTypeCard
        sourceTypeName={sourceTypeName}
        changeData={modifiedChangeData}
      />
    );
  }

  // Fallback to SourceTypeBoxTemplate for any remaining cases
  return (
    <SourceTypeBoxTemplate
      key={sourceTypeIndex}
      classNames="source-type-box"
      label={sourceTypeName}
      description={
        <div style={styles.dataCard}>
          {typeof sourceTypeValue === "object"
            ? renderObject(sourceTypeValue, "", false)
            : String(sourceTypeValue)}
        </div>
      }
      readonly={false}
    />
  );
};
