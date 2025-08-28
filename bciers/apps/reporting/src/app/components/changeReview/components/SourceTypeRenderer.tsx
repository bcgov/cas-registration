import React from "react";
import SourceTypeBoxTemplate from "@bciers/components/form/fields/SourceTypeBoxTemplate";
import { SourceTypeCard } from "./SourceTypeCard";
import { renderObject } from "./ObjectRenderer";
import {
  detectSourceTypeChanges,
  hasNestedChanges,
} from "@reporting/src/app/components/changeReview/utils/sourceTypeUtils";
import { styles } from "@reporting/src/app/components/changeReview/constants/styles";
import { SourceTypeChange } from "@reporting/src/app/components/changeReview/constants/types";

interface SourceTypeRendererProps {
  sourceTypeName: string;
  sourceTypeValue: any;
  sourceTypeIndex: number;
  sourceTypeChangesForActivity: SourceTypeChange[];
}

const normalizeChangeType = (type: string) =>
  type === "removed" ? "deleted" : type;

export const SourceTypeRenderer: React.FC<SourceTypeRendererProps> = ({
  sourceTypeName,
  sourceTypeValue,
  sourceTypeIndex,
  sourceTypeChangesForActivity,
}) => {
  const { changeType: sourceTypeChangeType, changeData } =
    detectSourceTypeChanges(
      sourceTypeName,
      sourceTypeValue,
      sourceTypeChangesForActivity,
    );
  const normalizedChangeType = normalizeChangeType(
    sourceTypeChangeType as string,
  );

  // Added/Deleted
  if (["added", "deleted"].includes(normalizedChangeType)) {
    let displayValue = sourceTypeValue;
    let displayName = sourceTypeName;
    if (changeData) {
      displayName = changeData.sourceTypeName || sourceTypeName;
      if (normalizedChangeType === "added" && changeData.newValue)
        displayValue = changeData.newValue;
      if (normalizedChangeType === "deleted" && changeData.oldValue)
        displayValue = changeData.oldValue;
    }
    return (
      <SourceTypeBoxTemplate
        key={sourceTypeIndex}
        classNames="source-type-box"
        label={displayName}
        description={
          <div style={styles.dataCard}>
            {typeof displayValue === "object"
              ? renderObject(
                  displayValue,
                  "",
                  normalizedChangeType === "deleted",
                )
              : String(displayValue)}
          </div>
        }
        readonly={false}
        sourceTypeChange={{ type: normalizedChangeType as "added" | "deleted" }}
        isDeleted={normalizedChangeType === "deleted"}
      />
    );
  }

  // Modified or nested changes
  if (
    hasNestedChanges(sourceTypeValue, sourceTypeChangeType) ||
    normalizedChangeType === "modified"
  ) {
    const modifiedChangeData = changeData || {
      sourceTypeName,
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
};
